import "./App.css"
import { useState, useRef, useEffect } from "react"
import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const socket = io("ws://localhost:3000")

const App = () => {

  const inputRef = useRef(null)
  

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState("")
  const [userList, setUserList] = useState([])
  const [roomList, setRoomList] = useState([])
  const [name, setName] = useState("")
  const [room, setRoom] = useState("")


  
  

  useEffect(() => {

    //Listen for incoming messages
    socket.on("message", (data) => {
      setTyping("")
      setMessages(prev => [...prev, data])
    })
    
    // Listen for typing activity
    let activityTimer
    socket.on("activity", (name) => {
      setTyping(`${name} is typing...`)

      //clear after 2 seconds
      clearTimeout(activityTimer)
      activityTimer = setTimeout(() => {
        setTyping("")
      }, 2000);

    })

    // Listening for user list updates
    socket.on("userList", ({ users }) => {
      setUserList(users || [])
    })

    // Listening for room list updates
    socket.on("roomList", ({ rooms }) => {
      setRoomList(rooms || [])
    })

    return () => {
      socket.off("message")
      socket.off("activity")
      socket.off("userList")
      socket.off("roomList")

    }
  }, [])

  const sendMessage = (e) => {
    e.preventDefault()
    if(name && message && room ) {
      socket.emit("message", { name, text: message })
      setMessage("")
    }
    inputRef.current?.focus()
  }



  

  function enterRoom(e) {
    e.preventDefault()
    if(name && room) {
      socket.emit("enterRoom", { name, room })
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    socket.emit("activity", name)
  }

  
  


  return (
    <main>

     <form className="form-join" onSubmit={enterRoom}>
        <input 
         type="text"
         id="name"
         maxLength={8}
         placeholder="Your name" 
         size={5}
         required 
         onChange={(e) => setName(e.target.value)}
         value={name}

        />
        <input 
          type="text"
          id="room"
          placeholder="Chat room"
          size={5}
          required
          onChange={(e) => setRoom(e.target.value)}
          value={room}


        />
        <button id="join" type="submit">Join</button>
     </form>

      <ul className="chat-display">
        {messages.map((msg, index) => (
          <li
           key={index}
           className={`post ${msg.name === name ? "post--left" : "post--right"}`}
           >
           {msg.name !== "Admin" && (
            <div className={`post__header ${msg.name === name ? "post__header--user" : "post__header--reply"}`}>
              <span className="post__header--name">{msg.name}</span>
              <span className="post__header--time">{msg.time}</span>
            </div>
           )}
           <div className="post__text">{msg.text}</div>
          </li>
        ))}
      </ul>
  
      <p className="user-list">
        {name && <strong>Users in {room}:</strong>} {userList.map(user => user.name).join(", ")}
      </p>
      <p className="room-list">
        {room && <strong>Active Rooms:</strong>} {roomList.join(", ")}
      </p>
      <p className="activity">{typing}</p>

      <form className="form-msg" onSubmit={sendMessage}>
        <input id="message" value={message} ref={inputRef} onChange={handleChange} type="text" placeholder="Your Message" />
        <button>Send</button>
      </form>

    </main>
  )
}

export default App