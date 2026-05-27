require('dotenv').config()
const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const OpenAI = require('openai').default
const { google } = require('googleapis')

const app = express()
app.use(cors())
app.use(express.json())

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY })

// ── Gmail ────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
})

// ── Google Calendar ──────────────────────────────────────────────────────────

function getCalendarClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return google.calendar({ version: 'v3', auth })
}

// ── MCP tool definitions ─────────────────────────────────────────────────────

const emailTools = [
  {
    type: 'function',
    function: {
      name: 'send_email',
      description: 'Send an email via Gmail',
      parameters: {
        type: 'object',
        properties: {
          to:      { type: 'string', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject line' },
          body:    { type: 'string', description: 'Plain-text email body' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
  },
]

const calendarTools = [
  {
    type: 'function',
    function: {
      name: 'create_calendar_event',
      description: 'Create a new event in Google Calendar',
      parameters: {
        type: 'object',
        properties: {
          title:          { type: 'string', description: 'Event title' },
          description:    { type: 'string', description: 'Event description or notes' },
          start_datetime: { type: 'string', description: 'Start date and time in ISO 8601 format' },
          end_datetime:   { type: 'string', description: 'End date and time in ISO 8601 format' },
          location:       { type: 'string', description: 'Event location' },
          attendees:      { type: 'array', items: { type: 'string' }, description: 'List of attendee email addresses' },
        },
        required: ['title', 'start_datetime', 'end_datetime'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_calendar_events',
      description: 'List upcoming events from Google Calendar',
      parameters: {
        type: 'object',
        properties: {
          time_min:    { type: 'string', description: 'Start of time range in ISO 8601 format' },
          time_max:    { type: 'string', description: 'End of time range in ISO 8601 format' },
          max_results: { type: 'number', description: 'Maximum number of events to return' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_calendar_event',
      description: 'Update an existing Google Calendar event',
      parameters: {
        type: 'object',
        properties: {
          event_id:       { type: 'string', description: 'The Google Calendar event ID' },
          title:          { type: 'string' },
          description:    { type: 'string' },
          start_datetime: { type: 'string' },
          end_datetime:   { type: 'string' },
          location:       { type: 'string' },
        },
        required: ['event_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_calendar_event',
      description: 'Delete a Google Calendar event',
      parameters: {
        type: 'object',
        properties: {
          event_id: { type: 'string', description: 'The Google Calendar event ID to delete' },
        },
        required: ['event_id'],
      },
    },
  },
]

// ── Tool executors ───────────────────────────────────────────────────────────

async function executeCalendarTool(name, args) {
  const cal = getCalendarClient()

  if (name === 'create_calendar_event') {
    const event = await cal.events.insert({
      calendarId: 'primary',
      resource: {
        summary:     args.title,
        description: args.description || '',
        location:    args.location || '',
        start: { dateTime: args.start_datetime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end:   { dateTime: args.end_datetime,   timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        attendees: (args.attendees || []).map(email => ({ email })),
      },
    })
    return `Event created: "${event.data.summary}" on ${event.data.start.dateTime}. Event ID: ${event.data.id}`
  }

  if (name === 'list_calendar_events') {
    const res = await cal.events.list({
      calendarId:   'primary',
      timeMin:      args.time_min || new Date().toISOString(),
      timeMax:      args.time_max,
      maxResults:   args.max_results || 10,
      singleEvents: true,
      orderBy:      'startTime',
    })
    const events = res.data.items || []
    if (!events.length) return 'No upcoming events found.'
    return events.map(e =>
      `[${e.id}] ${e.summary} — ${e.start.dateTime || e.start.date}${e.location ? ' @ ' + e.location : ''}`
    ).join('\n')
  }

  if (name === 'update_calendar_event') {
    const existing = await cal.events.get({ calendarId: 'primary', eventId: args.event_id })
    const patch = {}
    if (args.title)          patch.summary     = args.title
    if (args.description)    patch.description = args.description
    if (args.location)       patch.location    = args.location
    if (args.start_datetime) patch.start = { dateTime: args.start_datetime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
    if (args.end_datetime)   patch.end   = { dateTime: args.end_datetime,   timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
    await cal.events.patch({ calendarId: 'primary', eventId: args.event_id, resource: patch })
    return `Event "${existing.data.summary}" updated successfully.`
  }

  if (name === 'delete_calendar_event') {
    const existing = await cal.events.get({ calendarId: 'primary', eventId: args.event_id })
    await cal.events.delete({ calendarId: 'primary', eventId: args.event_id })
    return `Event "${existing.data.summary}" deleted.`
  }

  return 'Unknown tool.'
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.post('/api/send-email', async (req, res) => {
  const { to, subject, body } = req.body
  if (!to || !subject || !body)
    return res.status(400).json({ error: 'to, subject, and body are required' })

  try {
    const first = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an email assistant. Always use the send_email tool.' },
        { role: 'user',   content: `Send an email to ${to} with subject "${subject}" and body:\n\n${body}` },
      ],
      tools: emailTools,
      tool_choice: { type: 'function', function: { name: 'send_email' } },
    })

    const toolCall = first.choices[0].message.tool_calls?.[0]
    if (!toolCall) return res.status(500).json({ error: 'Model did not call the tool' })
    const args = JSON.parse(toolCall.function.arguments)

    await transporter.sendMail({
      from: `Fairy <${process.env.GMAIL_USER}>`,
      to: args.to, subject: args.subject, text: args.body,
    })

    const second = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        first.choices[0].message,
        { role: 'tool', tool_call_id: toolCall.id, content: 'Email sent successfully.' },
      ],
    })

    res.json({ success: true, message: second.choices[0].message.content })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/calendar', async (req, res) => {
  const { messages: history } = req.body
  if (!history?.length) return res.status(400).json({ error: 'messages are required' })

  try {
    const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone
    const localNow = new Date().toLocaleString('en-GB', {
      timeZone: userTZ, dateStyle: 'full', timeStyle: 'short',
    })
    const messages = [
      {
        role: 'system',
        content: `You are a calendar assistant. The current local date and time is: ${localNow} (${userTZ}).
Use the available tools to fulfill the user's request. If you need to update or delete an event, first list events to find the correct event ID.`,
      },
      ...history,
    ]

    // Agentic loop — model may need multiple tool calls (e.g. list then delete)
    for (let i = 0; i < 5; i++) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        tools: calendarTools,
      })

      const choice = response.choices[0]
      messages.push(choice.message)

      if (choice.finish_reason === 'stop') {
        return res.json({ success: true, message: choice.message.content })
      }

      if (choice.finish_reason === 'tool_calls') {
        for (const toolCall of choice.message.tool_calls) {
          const args   = JSON.parse(toolCall.function.arguments)
          const result = await executeCalendarTool(toolCall.function.name, args)
          messages.push({ role: 'tool', tool_call_id: toolCall.id, content: result })
        }
      }
    }

    res.status(500).json({ error: 'Agent did not complete in time' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3002
app.listen(PORT, () => console.log(`Fairy MCP server running on :${PORT}`))
