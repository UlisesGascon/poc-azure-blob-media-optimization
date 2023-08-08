const { BlobServiceClient } = require('@azure/storage-blob')
const { chunkArray } = require('@ulisesgascon/array-to-chunks')
const { existsSync } = require('fs')
const { join } = require('path')
const { uploadBlobFromLocalPath, getBlobServiceClient } = require('../utils')
const { parallelHttpRequestsLimit } = require('../config')
const metadata = require('../data/metadata.json')

;(async () => {
  const optimizedFolder = join(process.cwd(), 'data/optimized')
  console.log('📦 Upload workflow started...')

  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME
  const blobServiceClient = getBlobServiceClient()

  if (!existsSync(optimizedFolder)) {
    throw Error(`Folder ${optimizedFolder} not found. Please run the optimize workflow first.`)
  }
  // Create container client
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  )

  console.log(`ℹ️ Total blobs in scope ${metadata.length}...`)

  console.log('ℹ️ Uploading blobs...')

  const metadataChunks = chunkArray(metadata, parallelHttpRequestsLimit)
  for (const metadataChunk of metadataChunks) {
    await Promise.all(metadataChunk.map(blob => uploadBlobFromLocalPath(containerClient, blob.name, join(optimizedFolder, blob.name))))
  }

  console.log(`📦 Uploaded ${metadata.length} files in container ${containerName}`)
  console.log('✅ Upload workflow finished successfully')
})()
