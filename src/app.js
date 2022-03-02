const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const http = require('http')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { getUser, getUsersInRoom, removeUser, addUser } = require('./utils/users')

const server = http.createServer(app)
const io = socketio(server)

//Declaring Routers
const mainRouter = require('./routers/mainRouter')

//Paths
const publicPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname, './templates/views')
const partialsPath = path.join(__dirname,'./templates/partials')

//Hbs configuration
app.set('view engine','hbs')
app.set('views', viewsPath)
app.set('view options', { layout: './layouts/defaultLayout' })
hbs.registerPartials(partialsPath)
hbs.registerHelper('raw', function (value) {
    return value.fn()
});

//Express use functions
app.use(express.static(publicPath))
app.use(express.json())
app.use(express.urlencoded( { extended: true } ))



io.on('connection', (socket)=>{
    console.log("New websocket connection!")

    socket.on('join', ( { username, room }, callback ) => {
        const { error, user }  = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`)) //send to all unless the conected socket
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()
    })

    socket.on('newMessage', (message, callback)=> {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('Delivered')
    })

    socket.on('sendLocation', (coordinates, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`))
        callback('Location has been shared!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    })
})

//Adding routers
app.use(mainRouter)

//Exporting app
module.exports = server
