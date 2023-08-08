const { join } = require('path')
const { chunkArray } = require('@ulisesgascon/array-to-chunks')
const metadata = require('../data/metadata.json')
const { ONE_MB_IN_BYTES } = require('../constants')
const { imageMaxHeight, imageMaxWidth } = require('../config')
const sharp = require('sharp')

;(async () => {
  const dataFolder = join(process.cwd(), 'data')

  console.log('🍿 Resize workflow started...')

  console.log(`ℹ️ Checking ${metadata.length} images sizes...`)

  console.log('checking for images with bad dimensions...')

  // Filter images bigger than 1mb
  const hugeFiles = metadata.filter(blob => blob.properties.contentLength > ONE_MB_IN_BYTES && blob.mimeType?.mime?.includes('image'))

  const hugeFilesChunks = chunkArray(hugeFiles, 20)
  const hugeFilesReportLines = []
  for (const hugeFilesChunk of hugeFilesChunks) {
    const filesMetadata = await Promise.all(hugeFilesChunk.map(blob => sharp(join(dataFolder, blob.name)).metadata()))
    hugeFilesReportLines
      .push(...filesMetadata
        .filter(meta => meta.width > imageMaxWidth || meta.height > imageMaxHeight)
        .map((meta, i) => `- 🚨 ${hugeFilesChunk[i].name} is ${meta.width}x${meta.height} pixels`))
  }

  console.log(hugeFilesReportLines.join('\n'))

  console.log('✅ Resize workflow finished successfully')
})()
