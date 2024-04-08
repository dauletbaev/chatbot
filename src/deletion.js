const crypto = require('crypto')

exports.getDeletionStatus = (req, res) => {
  const userId = req.query.id
  const confirmationCode = req.query.confirmation_code

  // Since we don't have a stored data deletion process, we'll just return a success message
  res.send('Data deletion request successful.')
}

exports.deleteDataRequest = (req, res) => {
  const signedRequest = req.body.signed_request
  const data = parseSignedRequest(signedRequest, APP_SECRET)
  if (!data) {
    return res.status(400).send('Invalid signed request.')
  }
  const userId = data.user_id

  // Since we don't have a stored data deletion process, we'll just return a status URL

  const statusUrl = `https://chatbot.bizler.group/deletion?id=${userId}`
  const confirmationCode = 'delete'

  const responseData = {
    url: statusUrl,
    confirmation_code: confirmationCode,
  }
  res.json(responseData)
}

function parseSignedRequest(signedRequest, secret) {
  const [encodedSig, payload] = signedRequest.split('.', 2)

  // decode the data
  const sig = base64UrlDecode(encodedSig)
  const data = JSON.parse(base64UrlDecode(payload))

  // confirm the signature
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest()

  if (Buffer.compare(sig, expectedSig) !== 0) {
    console.error('Bad Signed JSON signature!')
    return null
  }

  return data
}

function base64UrlDecode(input) {
  // Replace URL-safe base64 encoding characters and decode
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}
