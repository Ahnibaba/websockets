import express from "express"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname =  path.dirname(__filename)

const PORT = process.env.PORT || 3000
const ADMIN = "Admin"

const app = express()

app.use(express.static(path.join(__dirname, "public")))

const expressServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    
})

//state
const UsersState = {
    users: [],
    setUsers: function(newUsersArray) {
        this.users = newUsersArray
    }
}


const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"]
    }
})




io.on("connection", socket => {
    console.log(`User ${socket.id} connected`);

    //Upon connection - only to user
    socket.emit("message", buildMsg(ADMIN, "Welcome to Chat App!"))

    socket.on("enterRoom", ({ name, room }) => {

        //leave previous room
        const prevRoom = getUser(socket.id)?.room
        if(prevRoom) {
            socket.leave(prevRoom)
            io.to(prevRoom).emit("message", buildMsg(ADMIN, `${name} has left the room`))
        }

        const user = activateUser(socket.id, name, room)

        //cannot update previous room users list until after the state update in activate user
        if(prevRoom) {
            io.to(prevRoom).emit("userList", {
               users: getUsersInRoom(prevRoom) 
            })
        }

        //join room
        socket.join(user.room)

        //To user who joined
        socket.emit("message", buildMsg(ADMIN, `You have joined the ${user.room} chat room`))

        //To everyone else in the room
        socket.broadcast.to(user.room).emit("message", buildMsg(ADMIN, `${user.name} has joined the room`))

        //Update room list for room
        io.to(user.room).emit("userList", {
            users: getUsersInRoom(user.room)
        })

        //Update room list for everyone
        io.emit("roomList", {
            rooms: getAllActiveRooms()
        })
    })

    //Upon connection - to all others except the user
    // socket.broadcast.emit("message", `User ${socket.id.substring(0, 5)} connected`)

    //When user disconnects - to all others
    socket.on("disconnect", () => {
        const user = getUser(socket.id)
        userLeavesApp(socket.id)
        
        if(user) {
            io.to(user.room).emit("message", buildMsg(ADMIN, `${user.name} has left the room`))

            io.to(user.room).emit("userList", {
                users: getUsersInRoom(user.room)
            })

            io.emit("roomList", {
                rooms: getAllActiveRooms()
            })
        }
    })
    
    //Listening for a message event
    socket.on("message", ({ name, text }) => {
        const room = getUser(socket.id)?.room
        if(room) {
           io.to(room).emit("message", buildMsg(name, text)) 
        }
        
        
    })

    

    //Listen for activity
    socket.on("activity", (data) => {
        const room = getUser(socket.id)?.room
        if(room) {
            socket.broadcast.to(room).emit("activity", data)
        }
    })
})


function buildMsg(name, text) {
    return {
        name,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
}

function getUser(id) {
    return UsersState.users.find(user => user.id === id)
}

function activateUser(id, name, room) {
   const user = { id, name, room } 
   UsersState.setUsers([
    ...UsersState.users.filter(user => user.id !== id),
    user
   ])
   return user
}

function getUsersInRoom(room) {
    return UsersState.users.filter(user => user.room === room)
}

function userLeavesApp(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    )
}

function getAllActiveRooms() {
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}

