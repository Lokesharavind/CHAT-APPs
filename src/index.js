const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const  server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))



// "server (emit) => client (receive) - countUpadted"
// "client (emit) => server(receive) - increment"

io.on('connection', (socket)=>{
    console.log('New WebSocket Connection')

    socket.emit('message', 'welcome')
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (message, callback) => {

        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.emit('message',message)
        if(typeof callback === 'function'){
            callback('delivered')
        }else{
            console.error('callback is not a function')
        }
    })
    socket.on('sendLocation', (coords, callback) => {
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('message', 'A user has left')
    })

    //socket.emit('countUpdated', count)

    //socket.on('increment', () =>{
    //    count++ 
        //"socket.emit('countUpdated', count)"
        //io.emit('countUpdated', count)
    //})
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})