const readChunk = require('read-chunk')
const imageType = require('image-type')
const { BlobServiceClient } = require('@azure/storage-blob')

// @see: https://stackoverflow.com/a/18650828
function formatBytes (bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// @see: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-download-javascript#download-to-a-file-path
async function downloadBlobToFile (containerClient, blobName, fileNameWithPath) {
  const blobClient = containerClient.getBlobClient(blobName)
  return blobClient.downloadToFile(fileNameWithPath)
}

// @see: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-javascript#upload-a-block-blob-from-a-file-path
async function uploadBlobFromLocalPath (containerClient, blobName, localFilePath) {
  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  return blockBlobClient.uploadFile(localFilePath)
}

function getMimeType (filePath) {
  const buffer = readChunk.sync(filePath, 0, 12)
  return imageType(buffer)
}

function getBlobServiceClient () {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
  const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN
  if (!accountName) throw Error('Azure Storage accountName not found')
  if (!sasToken) throw Error('Azure Storage accountKey not found')
  const blobServiceUri = `https://${accountName}.blob.core.windows.net`

  const blobServiceClient = new BlobServiceClient(`${blobServiceUri}?${sasToken}`, null)
  console.log(`🔑 Connecting to Azure Storage account ${accountName}...`)

  return blobServiceClient
}

module.exports = {
  formatBytes,
  downloadBlobToFile,
  uploadBlobFromLocalPath,
  getBlobServiceClient,
  getMimeType
}
