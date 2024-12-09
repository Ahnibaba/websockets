import "./App.css"
import { useState, useRef, useEffect } from "react"
import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const socket = io("ws://localhost:3000")

const App = () => {
  
  const inputRef = useRef(null)

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState("")

  useEffect(() => {
    socket.on("message", (data) => {
      setTyping("")
      setMessages(prev => [...prev, data])
      
    })

    let activityTimer
   

    socket.on("activity", (name) => {
      setTyping(`${name} is typing...`)

      //clear after 2 seconds
      clearTimeout(activityTimer)
      activityTimer = setTimeout(() => {
        setTyping("")
      }, 2000);
      
    })

    return () => {
      socket.off("message")
      
    }
  }, [])
  


  const sendMessage = (e) => {
    e.preventDefault()
    
    if (message) {
      socket.emit("message", message)
      console.log(message);
      setMessage("")
    }


    if (inputRef.current) {
      inputRef.current.focus()
    }

  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    socket.emit("activity") 
  }


  return (
    <div>
      <form onSubmit={sendMessage}>
        <input value={message} ref={inputRef} onChange={handleChange} type="text" placeholder="Your Message" />
        <button>Send</button>
      </form>
      <ul>
        {messages.map((eachMessage, index) => (
          <li key={index}>{eachMessage}</li>
        ))}
      </ul>
      <p>{typing}</p>
    </div>
  )
}

export default App