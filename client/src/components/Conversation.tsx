import { useState, useEffect } from "react";
import { useSocket } from '../context/SocketContext';
import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from '../context/AuthContext';

export default function Conversation () {

    const socket = useSocket();
    const { user } = useAuthContext();
    const { conversation, recipientUser } = useConversationContext();
    const [message, setMessage] = useState<string>('')

    
    
    const handleSubmit = (e:any) => {
        const recipientUserId = recipientUser!._id;
        const recipientUserUsername = recipientUser?.username;
        const currentUserId = user.userId;
        const currentUserName = user?.username;

        // handle conversation submission here
        e.preventDefault()
        socket.emit('private message', message, recipientUserId, recipientUserUsername, currentUserId, currentUserName)
        setMessage('')
    };

    useEffect(() => {

        socket.on('messageReceive', (msgR) => {
            const newElement = document.createElement('p')
            const msg = document.createTextNode(msgR)
            newElement.appendChild(msg)
            const con = document.getElementsByClassName("conversation-messages")
            con[0].appendChild(newElement)
        });

    }, [socket])


    return (
        <section className="conversation-personal">
            <strong>{recipientUser?.username}</strong>
            <div className="conversation-messages">
                {conversation?.messages && conversation.messages.map((c: any) => (
                    <p key={c._id}>{c.content}</p>
                ))}
            </div>
            
            <form onSubmit={handleSubmit}>
                <input value={message} onChange={e => setMessage(e.target.value)}/>
                <button>send</button>
            </form>
            
        </section>
    )
}