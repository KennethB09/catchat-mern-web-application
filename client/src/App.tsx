import { useState } from 'react'
import { io } from 'socket.io-client';

// Connect to the server

const socket = io('http://localhost:5000');

function App() {
  const [message, setMessage] = useState<String>("hello world")
  
  socket.emit('message', message);
  
  socket.on('message', (msg) => {
    console.log(msg);
  });

  return (
    <>
      <p>{message}</p>
    </>
  )
}

export default App
