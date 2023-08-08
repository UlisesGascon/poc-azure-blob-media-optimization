const { ONE_MB_IN_BYTES } = require('./constants')

module.exports = Object.freeze({
  ignoreBlobsPattern: 'temp/',
  blobDownloadLimitInBytes: 15 * ONE_MB_IN_BYTES, // 15mb
  parallelHttpRequestsLimit: 50,
  imageMaxWidth: 1000,
  imageMaxHeight: 1000
})
