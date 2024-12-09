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
    
    socket.on("message", data => {
        console.log(data.toString());
        io.emit("message", `${socket.id.substring(0, 5)}: ${data}`)

    })
})



