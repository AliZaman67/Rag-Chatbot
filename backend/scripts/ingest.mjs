// Run: node scripts/ingest.mjs path/to/file.txt
// Reads a text file, POSTs it to this backend's /api/ingest, backend does the chunk+embed+store.

import fs from 'node:fs'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8787'

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: node scripts/ingest.mjs <file.txt>')
    process.exit(1)
  }

  const text = fs.readFileSync(filePath, 'utf-8')
  console.log(`Sending ${filePath} to ${BACKEND_URL}/api/ingest ...`)

  const res = await fetch(`${BACKEND_URL}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source: filePath })
  })

  const data = await res.json()
  if (!res.ok) {
    console.error('Ingest failed:', data.error)
    process.exit(1)
  }
  console.log(`Done. Inserted ${data.inserted}/${data.totalChunks} chunks.`)
}

main()
