const ws = require("ws")
const server = new ws.Server({ port: "3001" })

server.on("connection", socket => {
    socket.on("message", message => {
        console.log(message.toString());
        socket.send(`${message}`)
        
    })
})