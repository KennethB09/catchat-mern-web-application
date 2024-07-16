import { useState, useEffect } from "react";
import { useSearchContext } from "../context/SearchContext";
import { useAuthContext } from "../context/AuthContext";
import { useConversationContext } from '../context/ConversationContext';

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
    user: userInterface;
  }
export default function SearchBar() {
    
    const { user } = useAuthContext();
    const { dispatch } = useConversationContext();
    const [input, setInput] = useState<string>("");
    const { searchResult, setSearchResult } = useSearchContext();

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (input.trim().length > 0) {
                handleSearch();
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [input]);

    const handleSearch = async () => {

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/search?username=${input}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            setSearchResult(data); // Convert to string for display
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    const handleClick = async (userId:string) => {

        const users = {userId, currentUserId: user.userId}

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversation`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(users)
        });

        const json: dataInterface = await response.json();
        console.log(json)
        if (response.ok) {
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: json.conversation });
            dispatch({ type: 'SET_USER', payload: json.user });
        };
    };

    return (
        <div>
            <input 
                type="text" 
                placeholder="Search..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {input !== "" ?  searchResult?.map((user: userInterface) => {
                return (
                    <div key={user._id} onClick={() => handleClick(user._id)}>
                        <p>{user.username}</p>
                        <p>{user._id}</p>
                    </div>
                )
            }) : <></>}
        </div>
    )
}