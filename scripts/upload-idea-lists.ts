/**
 * Upload compressed idea list PDFs to Vercel Blob.
 *
 * Uploads all PDFs from the compressed folder with stable pathnames
 * under the "idea-lists/" prefix so URLs stay consistent.
 *
 * Usage:
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/upload-idea-lists.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local
 */
import { put, list, del } from '@vercel/blob'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, basename } from 'path'

const SOURCE_DIR =
  '/Users/ameliedrouin/Desktop/Anywhere Learning/Idea Lists/compressed'
const BLOB_PREFIX = 'idea-lists/'

function fmtKB(bytes: number) {
  return `${Math.round(bytes / 1024)}KB`
}

async function main() {
  console.log('\n=== Idea Lists Upload ===\n')

  // 1. Gather local PDFs
  const files = readdirSync(SOURCE_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort()

  console.log(`Found ${files.length} PDFs in compressed folder.\n`)

  let totalBytes = 0
  let uploaded = 0

  // 2. Upload each file
  for (const file of files) {
    const localPath = join(SOURCE_DIR, file)
    const size = statSync(localPath).size
    totalBytes += size

    const blobPathname = `${BLOB_PREFIX}${file}`

    process.stdout.write(
      `  Uploading ${file} (${fmtKB(size)})... `
    )

    try {
      const buf = readFileSync(localPath)
      const result = await put(blobPathname, buf, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      console.log(`done`)
      console.log(`    → ${result.url}`)
      uploaded++
    } catch (err) {
      console.log(`FAILED: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(
    `\n=== Done: ${uploaded}/${files.length} uploaded (${fmtKB(totalBytes)} total) ===\n`
  )
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
