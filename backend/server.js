import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import ragRoutes from './routes/rag.js'

const app = express()
const PORT = process.env.PORT || 8787
const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')

app.use(cors({ origin: origins }))
app.use(express.json({ limit: '2mb' }))

app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/api', ragRoutes)

app.listen(PORT, () => {
  console.log(`Nexus backend running on http://localhost:${PORT}`)
})
