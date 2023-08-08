const debug = require('debug')('download')
const { chunkArray } = require('@ulisesgascon/array-to-chunks')
const { existsSync, mkdirSync, writeFileSync } = require('fs')
const { join } = require('path')
const { formatBytes, downloadBlobToFile, getMimeType, getBlobServiceClient } = require('../utils')
const { ignoreBlobsPattern, blobDownloadLimitInBytes, parallelHttpRequestsLimit } = require('../config')

;(async () => {
  const dataFolder = join(process.cwd(), 'data')

  console.log('📦 Download workflow started...')
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME

  const blobServiceClient = getBlobServiceClient()

  if (!existsSync(dataFolder)) {
    mkdirSync(dataFolder)
    console.log(`Created ${dataFolder}`)
  }

  // Create container client
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  )

  // List blobs in container
  console.log('ℹ️ Filtering blobs...')
  const blobsInScope = []
  for await (const blob of containerClient.listBlobsFlat()) {
    // Ignore temp/* blobs
    if (!blob.name.includes(ignoreBlobsPattern) && blob.properties.contentLength < blobDownloadLimitInBytes) {
      blobsInScope.push(blob)
      debug(`Found blob ${blob.name} with size ${formatBytes(blob.properties.contentLength)}`)
    }
  }

  console.log(`ℹ️ Found ${blobsInScope.length} blobs in container ${containerName}`)
  console.log('ℹ️ Downloading blobs...')

  const blobsInScopeChunks = chunkArray(blobsInScope, parallelHttpRequestsLimit)
  for (const blobsInScopeChunk of blobsInScopeChunks) {
    await Promise.all(blobsInScopeChunk.map(blob => downloadBlobToFile(containerClient, blob.name, join(dataFolder, blob.name))))
  }

  console.log(`📦 Downloaded ${blobsInScope.length} files in container ${dataFolder}`)

  console.log('ℹ️ Generating metadata file...')
  const metadata = blobsInScope.map(blob => ({ ...blob, mimeType: getMimeType(join(dataFolder, blob.name)) }))
  const metadataFilePath = join(dataFolder, 'metadata.json')
  writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2))
  console.log(`📦 Metadata saved in ${metadataFilePath}`)

  console.log('✅ Download workflow finished successfully')
})()
