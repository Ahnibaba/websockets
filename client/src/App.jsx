import "./App.css"
import { useState, useRef } from "react"

const App = () => {
  const socket = new WebSocket("ws://localhost:3001")
  const inputRef = useRef(null)

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  if (inputRef.current) {
    inputRef.current.focus()
  }


  const sendMessage = (e) => {
    e.preventDefault()

    
    if (message) {
      socket.send(message)
      console.log(message);
      setMessages(prev => [...prev, message])
      setMessage("")
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