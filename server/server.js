import { createServer } from "http"
import { Server } from "socket.io"

const httpServer = createServer()

const io = new Server(httpServer, {
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

httpServer.listen(3000, () => {
    console.log("Listening on port " + 3000);
    
})