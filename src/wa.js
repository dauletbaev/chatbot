const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN

const sendReply = (phone_number_id, whatsapp_token, to, reply_message) => {
  let json = {
    messaging_product: 'whatsapp',
    to: to,
    text: { body: reply_message },
  }
  let data = JSON.stringify(json)
  let path =
    '/v12.0/' + phone_number_id + '/messages?access_token=' + whatsapp_token
  let options = {
    host: 'graph.facebook.com',
    path: path,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }
  let callback = (response) => {
    let str = ''
    response.on('data', (chunk) => {
      str += chunk
    })
    response.on('end', () => {})
  }
  let req = https.request(options, callback)
  req.on('error', (e) => {})
  req.write(data)
  req.end()
}

// https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
// to learn more about GET request for webhook verification
exports.GET = async (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED')
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(400)
  }
}

// process POST request (WhatsApp chat messages)
// https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
// to learn about WhatsApp text message payload structure
exports.POST = async (req, res) => {
  const body = req.body
  const entries = body.entry

  for (const entry of entries) {
    for (const change of entry.changes) {
      const value = change.value
      if (value) {
        const phone_number_id = value.metadata.phone_number_id
        if (value.messages) {
          for (const message of value.messages) {
            if (message.type === 'text') {
              const from = message.from
              const message_body = message.text.body
              const reply_message = 'Ack from AWS lambda: ' + message_body
              sendReply(phone_number_id, WHATSAPP_TOKEN, from, reply_message)
              res.status(200).send('Done')
            }
          }
        }
      }
    }
  }
}
