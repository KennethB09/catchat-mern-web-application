import { Dispatch, SetStateAction, useState } from 'react'

import { useAuthContext } from "../context/AuthContext";

import { userInterface, ConversationInterface } from "../ts/interfaces/Conversation_interface";
// Components
import SearchBar from "./SearchBar";
import Navigation from "./Navigation";
import CreateGroup from "./CreateConversation";
// UI component
import {
    Sheet,
    SheetTitle,
    SheetDescription,
    SheetContent,
    SheetClose,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import Image from './Image';

interface dataInterface {
    conversation: ConversationInterface;
    user: userInterface;
}

interface HeaderProps {
    isOnlineLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    onlineUsers: userInterface[] | null;
    onClickUser: () => void;
    clickedConversation: (conversationType: string, recipientUser: userInterface, conversation: ConversationInterface) => void;
}

export default function Header({ onlineUsers, setIsLoading, onClickUser, isOnlineLoading, clickedConversation }: HeaderProps) {

    const { user } = useAuthContext();
    const [toggle, setToggle] = useState(false);

    function onClick() {
        setToggle(prev => !prev);
    };

    const handleClick = async (userId: string) => {
        setIsLoading(true);

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversation`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, currentUserId: user.userId })
        });

        const json: dataInterface = await response.json();

        if (response.ok) {
            setIsLoading(false);
            if (json.conversation === null) {
                setIsLoading(false);
                clickedConversation('new_conversation', json.user, json.conversation);
                return;
            }
            clickedConversation('personal', json.user, json.conversation);
        };
    };

    return (
        <header className="">
            <div className="">

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
                        <SheetContent side='left' className="flex flex-col dark:bg-gray-800 border-none">
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
                            <svg className='fill-orange-500 w-8 h-8' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                                <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                            </svg>
                        </SheetTrigger>

                        <SheetContent side='right' className="dark:bg-gray-800 border-none w-full">
                            <SheetClose onClick={onClick}>
                                <svg className="fill-orange-600 opacity-70 transition-opacity hover:opacity-100" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                                </svg>
                            </SheetClose>
                            <CreateGroup createGroup={onClickUser} toggleState={onClick} setIsLoading={setIsLoading} />
                        </SheetContent>
                    </Sheet>
                </div>

                <SearchBar handleClick={handleClick} type='onClick' placeholder='Search' />

                {!isOnlineLoading ?
                    <div className="pt-4 pb-2 flex flex-row gap-3 no-scrollbar overflow-x-scroll h-min w-full">
                        {onlineUsers && onlineUsers.map(users => (
                            <div key={users._id}>
                                <Image className="w-12 h-12 rounded-full border-solid border-orange-500 border-2" alt={users.username} imageSource={users.userAvatar}/>
                            </div>
                        ))}
                    </div>
                    :
                    <div className="pt-4 pb-2 flex flex-row gap-3 no-scrollbar overflow-x-scroll h-min w-full">
                        {'1234567'.split('').map(i => (
                            <Skeleton key={i} className="bg-slate-300 dark:bg-slate-800 min-w-12 h-12 rounded-full" />
                        ))}
                    </div>
                }

            </div>

        </header>
    )
}