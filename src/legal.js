const path = require('path')

const pagesFolder = path.join(process.cwd(), '/pages')

exports.termsOfService = (_, res) => {
  res.sendFile(path.join(pagesFolder, 'terms-of-service.html'))
}

exports.privacyPolicy = (_, res) => {
  res.sendFile(path.join(pagesFolder, 'privacy-policy.html'))
}
