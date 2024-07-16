import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from '../context/AuthContext';
import { useState } from 'react';

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
    messages: (MessagesInterface[] | null);
  }
  
  
  interface dataInterface {
    conversation: ConversationInterface;
  }

export default function ConversationList({ conversation }: dataInterface) {

    const { dispatch } = useConversationContext();
    const { user } = useAuthContext();

    const username: userInterface[] = conversation.participants.filter(participant => participant._id !== user.userId);

    function conversationClick() {
        dispatch({ type: 'SET_CLICK_CONVERSATION', payload: conversation });
        dispatch({ type: 'SET_USER', payload: username[0]});
    };

    // const [username, setUsername] = useState();


    return (
        <li key={conversation._id} onClick={conversationClick}>
            <strong>{username.flatMap(u => u.username)}</strong>
        </li>
    )
}