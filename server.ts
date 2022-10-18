// npx esbuild --bundle server.ts --outdir=dist --platform=node --format=esm --minify; node .\dist\server.js
import express from 'express'
const app = express()
import { createServer } from 'http'
const server = createServer(app)
import { Server } from 'socket.io'
const io = new Server(server, { cors: { origin: '*' } })
//import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", "'unsafe-inline'"]
      }
    }
  })
)
// app.use(cors())
app.use(express.json())
app.use(
  rateLimit({
    windowMs: 1000 * 20,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false
  })
)

// @ts-expect-error (ts-node doesn't like ./db)
// import { gameIdMap, login } from './db.ts'
// console.log('DATABASE CONNECTED AND LOADED!')

// DEFAULT SVELTEKIT PAGES
import { handler } from './build/handler.js'
app.use(handler)

io.on('connection', async (socket) => {
  // get ip of client
  console.log('Connection from ' + socket.handshake.headers['x-forwarded-for'])
  socket.on('disconnect', () => console.log(`${io.sockets.sockets.size} users connected`))
})

const { PORT = 2000 } = process.env
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
