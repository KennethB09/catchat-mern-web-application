import { useSocket } from '../context/SocketContext';
import { useState, useEffect } from 'react';

import ConversationList from '../components/ConversationsList';
import Conversation from "../components/Conversation";
import SearchBar from "../components/SearchBar";

import { useAuthContext } from '../context/AuthContext';

interface userInterface {
    _id: string;
    username: string;
  }
  
  interface MessagesInterface {
    sender: string;
    content: string;
    createdAt: string;
  }
  
  interface ConversationInterface {
    _id: string;
    participants: userInterface[];
    conversationType: string[];
    messages: (MessagesInterface[]);
  }
  
  
  interface UserConversation {
    conversation: ConversationInterface[];
  }

export default function Home () {

    const socket = useSocket();
    const { user } = useAuthContext();
    const [currentUserConversation, setCurrentUserConversation] = useState<UserConversation>()
    const [isOnline, setIsOnline] = useState<string>('');
    
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversations`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
   
            if (response.ok) {
                setCurrentUserConversation(data)
            }
        }
        
        if (user) {
            fetchData();
            
            socket.on('userOnline', (socket: string) => {
                   setIsOnline(socket);
            });
        }

    }, [user, socket]);

    return (
        <>
            <SearchBar />
            <h1>User {isOnline} is online</h1>
            <ul className='ConversationList'>
                {currentUserConversation?.conversation && currentUserConversation.conversation.map((c: ConversationInterface) => (
                    <ConversationList key={c._id} conversation={c} />
                ))}
            </ul>
            <Conversation />
        </>
    );
}