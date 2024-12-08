import "./App.css"
import { useState, useRef, useEffect } from "react"
import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const App = () => {
  const socket = io("ws://localhost:3000")
  const inputRef = useRef(null)

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages(prev => [...prev, data])
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
  return (
    <div>
      <form onSubmit={sendMessage}>
        <input value={message} ref={inputRef} onChange={e => setMessage(e.target.value)} type="text" placeholder="Your Message" />
        <button>Send</button>
      </form>
      <ul>
        {messages.map((eachMessage, index) => (
          <li key={index}>{eachMessage}</li>
        ))}
      </ul>
    </div>
  )
}

export default App