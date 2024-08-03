import { useState } from 'react'

import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from "../context/AuthContext";

import { userInterface, ConversationInterface } from "../ts/interfaces/Conversation_interface";

import SearchBar from "./SearchBar";
import Navigation from "./Navigation";
import blankAvatar from '../assets/avatar/blank avatar.jpg';
import CreateGroup from "./CreateConversation";

// Shadcn component
import {
    Sheet,
    SheetTitle,
    SheetDescription,
    SheetContent,
    SheetClose,
    SheetTrigger,
} from "@/components/ui/sheet"

interface dataInterface {
    conversation: ConversationInterface;
    user: userInterface;
}

interface HeaderProps {
    onlineUsers: userInterface[] | null;
    onClickUser: () => void;
}

export default function Header({ onlineUsers, onClickUser }: HeaderProps) {

    const { user } = useAuthContext();
    const { dispatch } = useConversationContext();
    const [toggle, setToggle] = useState(false);

    function onClick() {
        setToggle(prev => !prev);
    };

    const handleClick = async (userId: string) => {

        const users = { userId, currentUserId: user.userId }

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
            onClickUser()
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: json.conversation });
            dispatch({ type: 'SET_USER', payload: json.user });
        };
    };

    return (
        <header className="">
            <div className="p-4">

                <div className="flex pb-4">
                    <Sheet>
                        <SheetTitle className='hidden'>
                            navigation
                        </SheetTitle>
                        <SheetDescription className='hidden'>
                            Show user settings and profile
                        </SheetDescription>
                        <SheetTrigger>
                            <svg className="fill-orange-500 aspect-square w-10 h-9" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                            </svg>
                        </SheetTrigger>
                        <SheetContent side='left' className="dark:bg-gray-800 border-none">
                           <Navigation />
                        </SheetContent>
                    </Sheet>
                    
                    <Sheet open={toggle}>
                        <SheetTitle className='hidden'>
                            create group
                        </SheetTitle>
                        <SheetDescription className='hidden'>
                            Create a new group
                        </SheetDescription>
                        <SheetTrigger className="ml-auto " onClick={onClick}>
                            <svg className="fill-orange-500 border-orange-500 w-7 h-7 border-2 rounded-full" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                            </svg>
                        </SheetTrigger>
                        
                        <SheetContent side='right' className="dark:bg-gray-800 border-none w-full">
                            <SheetClose onClick={onClick}>
                                <svg className="fill-orange-600 opacity-70 transition-opacity hover:opacity-100" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                                </svg>
                            </SheetClose>
                            <CreateGroup createGroup={onClickUser} toggleState={onClick}/>
                        </SheetContent>
                    </Sheet>
                </div>

                <SearchBar handleClick={handleClick} type='onClick' />

                <div className="pt-4 flex gap-2 overflow-y-scroll">
                    {onlineUsers && onlineUsers.map(users => (
                        <div key={users._id}>
                            <img className="w-12 h-12 rounded-full border-solid border-orange-500 border-2" src={users.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${users.userAvatar}`} alt={users.username} />
                        </div>
                    ))}
                </div>

            </div>

        </header>
    )
}