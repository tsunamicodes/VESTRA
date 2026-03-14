const express = require('express')
const cors = require('cors')
const searchRoute = require('./routes/search')
require('dotenv').config()
const compareRoute = require('./routes/compare')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/search', searchRoute)
app.use('/compare', compareRoute)

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to VESTRA API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      search: '/search?q=your+query',
      compare: '/compare?name=product+name'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'VESTRA backend is running',
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`VESTRA backend running on http://localhost:${PORT}`)
})