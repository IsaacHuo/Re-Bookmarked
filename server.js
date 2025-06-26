import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.APP_PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

async function setupRoutes() {
  try {
    const { default: parseHandler } = await import('./api/parse.js')
    const { default: organizeHandler } = await import('./api/organize.js')
    const { default: generateHtmlHandler } = await import('./api/generate-html.js')
    
    app.post('/api/parse', parseHandler)
    app.post('/api/organize', organizeHandler)
    app.post('/api/generate-html', generateHtmlHandler)
    
    console.log('✓ Routes loaded')
  } catch (error) {
    console.error('✗ Route error:', error)
  }
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    qwen: !!process.env.DASHSCOPE_API_KEY
  })
})

async function startServer() {
  await setupRoutes()
  
  app.listen(port, () => {
    console.log(`
🚀 Server running on port ${port}
📝 Endpoints:
   - POST /api/parse
   - POST /api/organize  
   - POST /api/generate-html
   - GET  /api/health

🔑 Qwen: ${process.env.DASHSCOPE_API_KEY ? 'configured' : 'missing'}
`)
  })
}

startServer().catch(console.error)
