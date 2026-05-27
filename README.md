# ✦ Fairy

Your personal day-to-day assistant — send emails, create calendar events, message via WhatsApp, and chat with AI.

## Stack
- **Frontend**: React + Vite
- **AI**: Anthropic Claude API (claude-sonnet-4)
- **Integrations**: Gmail MCP, Google Calendar MCP, WhatsApp Business API

---

## Getting Started

```bash
cd fairy
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OPENAI_API_KEY=sk-...          # For ChatGPT feature
WHATSAPP_TOKEN=your_whatsapp_token  # For WhatsApp (server-side only)
```

> ⚠️ Never expose `ANTHROPIC_API_KEY` or `WHATSAPP_TOKEN` in client-side code in production. Route them through a Node.js backend.

---

## Recommended MCP Connectors

These connectors power the core features. Connect them via your MCP-compatible backend or Claude.ai:

| Feature | Connector | URL |
|---|---|---|
| ✉ Email | **Gmail MCP** | `https://gmailmcp.googleapis.com/mcp/v1` |
| ◷ Calendar | **Google Calendar MCP** | `https://calendarmcp.googleapis.com/mcp/v1` |
| 📁 Files | **Google Drive MCP** | `https://drivemcp.googleapis.com/mcp/v1` |

### Additional Connectors to Add

| Feature | Why You'd Want It |
|---|---|
| **WhatsApp Business API** | Send/receive WhatsApp messages programmatically. Requires a Meta Business account. [docs.whatsapp.com](https://developers.facebook.com/docs/whatsapp) |
| **Slack MCP** | Send Slack messages to teammates directly from Fairy |
| **Notion MCP** | Create notes, meeting agendas, and to-do lists |
| **Todoist / Linear MCP** | Task management — create/update tasks from Fairy |
| **OpenAI API** | Route ChatGPT queries to GPT-4o instead of Claude |
| **Twilio SMS** | Send SMS messages as an alternative to WhatsApp |
| **Zoom / Google Meet** | Auto-create video call links when creating calendar events |

---

## Architecture

```
fairy/
├── src/
│   ├── App.jsx                  # Router/shell
│   ├── index.css                # Design tokens + global styles
│   └── components/
│       ├── Sidebar.jsx          # Navigation
│       ├── Dashboard.jsx        # Home with quick actions
│       ├── AskFairy.jsx         # AI chat interface
│       ├── EmailComposer.jsx    # Gmail integration
│       ├── CalendarEvent.jsx    # Google Calendar integration
│       ├── WhatsAppComposer.jsx # WhatsApp integration
│       ├── ChatGPT.jsx          # OpenAI bridge
│       └── PageHeader.jsx       # Shared page header
├── index.html
├── vite.config.js
└── package.json
```

---

## Production Checklist

- [ ] Move all API keys to a Node.js backend (Express/Fastify)
- [ ] Add authentication (OAuth2 for Google, JWT for your own users)
- [ ] Replace simulated sends with real MCP / API calls
- [ ] Add WhatsApp Business API credentials
- [ ] Set up OpenAI key for ChatGPT feature
- [ ] Deploy frontend (Vercel / Netlify) + backend (Railway / Render)
