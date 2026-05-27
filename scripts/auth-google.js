require('dotenv').config()
const { google } = require('googleapis')
const readline = require('readline')

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent',
})

console.log('\n1. Open this URL in your browser:\n')
console.log(authUrl)
console.log('\n2. Authorise the app and paste the code below.\n')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question('Paste code: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim())
    console.log('\n✓ Add this line to your .env file:\n')
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
  } catch (err) {
    console.error('Error getting token:', err.message)
  }
  rl.close()
})
