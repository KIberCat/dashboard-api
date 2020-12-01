const http = require('http')
const express = require('express')
const socketIo = require('socket.io')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
})

io.on('connection', socket => {
  const tags = db.get('tags').value()
  io.emit('SET_TAGS', tags)

  socket.on('CREATE_TAG', data => {
    db.get('tags')
      .push({
        id: Date.now(),
        ...data
      })
      .write()

    const tags = db.get('tags').value()
    io.emit('SET_TAGS', tags)
  })

  socket.on('REMOVE_TAG', id => {
    db.get('tags')
      .remove({ id: id })
      .write()

    const tags = db.get('tags').value()
    io.emit('SET_TAGS', tags)
  })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
  console.log('Start server...')
})
