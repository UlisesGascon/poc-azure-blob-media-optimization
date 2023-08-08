const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const { existsSync, mkdirSync, rmSync, statSync } = require('fs')
const { join } = require('path')
const { formatBytes } = require('../utils')
const metadata = require('../data/metadata.json')

;(async () => {
  const dataFolder = join(process.cwd(), 'data')
  const optimizedFolder = `${dataFolder}/optimized`

  console.log('💅 Optimize workflow started...')

  console.log(`ℹ️ Optimizing ${metadata.length} images...`)

  if (!existsSync(optimizedFolder)) {
    mkdirSync(optimizedFolder)
    console.log(`ℹ️ Created ${optimizedFolder}`)
  } else {
    rmSync(optimizedFolder, { recursive: true, force: true })
    console.log(`ℹ️ Cleaned ${optimizedFolder}`)
  }

  console.log('ℹ️ Optimizing images...')
  await imagemin([`${dataFolder}/**`], {
    destination: optimizedFolder,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8]
      })
    ]
  })

  console.log('ℹ️ Building report...')
  const reportLines = metadata.map(blob => {
    const originalSize = blob.properties.contentLength
    const optimizedFilePath = `${optimizedFolder}/${blob.name}`
    const optimizedSize = existsSync(optimizedFilePath) ? statSync(optimizedFilePath).size : 0
    if (optimizedSize === 0) {
      throw Error(`❌ ${blob.name} was not optimized!`)
    }

    const savedBytes = originalSize - optimizedSize
    if (savedBytes === 0) {
      return `- ${blob.name} was not optimized`
    }
    const savedPercentage = Math.round(savedBytes / originalSize * 100)
    return `- ${blob.name} was optimized from ${formatBytes(originalSize)} to ${formatBytes(optimizedSize)} (${savedPercentage}%)`
  })

  console.log(reportLines.join('\n'))

  console.log('✅ Optimize workflow finished successfully')
})()
