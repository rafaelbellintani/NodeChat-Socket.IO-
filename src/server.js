const server = require('./app.js')
const port = process.env.port

server.listen(port, ()=>{
    console.log(`Connected successfuly at port ${port}`)
})