import fs from 'node:fs'
import path from 'node:path'

const FILE_PATH = path.join(process.cwd(), 'knowledge.txt')

// Reads knowledge.txt fresh each call — small file, cheap, always up to date
// with whatever you last saved. No embeddings, no OpenAI, no cost.
export function loadKnowledge() {
  try {
    return fs.readFileSync(FILE_PATH, 'utf-8')
  } catch {
    return '' // file doesn't exist yet — fine, just means no notes loaded
  }
}
