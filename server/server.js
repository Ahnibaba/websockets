import express from "express"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from "url"

const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname =  path.dirname(__filename)

const app = express()

app.use(express.static(path.join(__dirname, "public")))

const expressServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    
})



const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"]
    }
})




io.on("connection", socket => {
    console.log(`User ${socket.id} connected`);

    //Upon connection - only to user
    socket.emit("message", "Welcome to Chat App")

    //Upon connection - to all others except the user
    socket.broadcast.emit("message", `User ${socket.id.substring(0, 5)} connected`)
    
    //Listening for a message event
    socket.on("message", data => {
        console.log(data.toString());
        io.emit("message", `${socket.id.substring(0, 5)}: ${data}`)

    })

    //When user disconnects - to all others
    socket.on("disconnect", () => {
        socket.broadcast.emit("message", `User ${socket.id.substring(0, 5)} disconnected`)
    })

    //Listen for activity
    socket.on("activity", () => {
        socket.broadcast.emit("activity", `${socket.id.substring(0, 5)}`)
    })
})



