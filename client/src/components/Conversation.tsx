import React, { useState, useEffect, useRef } from "react";
import { socket } from '../socket';
// Context Hooks
import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from '../context/AuthContext';
import { useToastContext } from '@/hooks/useToast';
// UI Components
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetTitle,
    SheetDescription,
    SheetContent,
    SheetClose,
    SheetTrigger,
} from "@/components/ui/sheet";
// Components
import ConversationInfo from "./ConversationInfo";
import Image from "./Image";
// Interfaces
import { MessagesInterface } from "../ts/interfaces/Conversation_interface";

type ConversationProps = {
    onClickConversation: boolean;
    onClick: () => void;
    privateMessage: (newMessage: MessagesInterface, recipientId: string, senderId: string) => void;
    groupMessage: (newMessage: MessagesInterface, conversationId: string) => void;
}

export default function Conversation({ onClickConversation, onClick, privateMessage, groupMessage }: ConversationProps) {

    const { user } = useAuthContext();
    const { blockedUsers, conversation, recipientUser, dispatch } = useConversationContext();
    const { toast } = useToastContext();
    const [message, setMessage] = useState<string>('')
    const newMessageRef = useRef<HTMLDivElement>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [roomId, setRoomId] = useState<string>("");
    const [senderAvatar, setSenderAvatar] = useState('');
    const [recipientBlockedUsers, setRecipientBlockedUsers] = useState<string[]>([]);

    // Check if the recipient user is in current user blocked list.
    const isUserBlocked: boolean | null = blockedUsers!.some(blockedUser => blockedUser._id === recipientUser?._id);
    // Check if the current user is in recipient user blocked list.
    const isCurrentUserBlocked = recipientUser?.blockedUser?.some(blockedUserId => blockedUserId === user.userId);
    // True if the recipient user blocked the current user.
    const isCurrentUserGetBlocked = recipientBlockedUsers.some(id => id === user.userId);

    const messagesLength = conversation?.messages?.length;

    const loadMoreMessage = async () => {
        const conversationId = conversation?._id;
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/load-message`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversationId,
                limit: 20,
                skip: messagesLength
            })
        });

        const data = await response.json();

        if (response.ok) {
            setIsLoading(false);
            dispatch({ type: 'LOAD_MESSAGE', payload: data })

        } else {
            setIsLoading(false);
            toast({
                title: "Ops, something went wrong",
                description: data.error,
                variant: 'destructive'
            });
        }
    };

    useEffect(() => {
        let typingTimer: NodeJS.Timeout;

        if(message === "") {
            typingTimer = setTimeout(() => {
                socket.emit("stopped-typing", {
                    roomId: conversation?._id,
                    typing: false
                })
            }, 3000)
        };

        if(message) {
            typingTimer = setTimeout(() => {
                socket.emit("stopped-typing", {
                    roomId: conversation?._id,
                    typing: false
                })
            }, 3000)
        };

        return () => {
            clearTimeout(typingTimer);
        }
    });

    useEffect(() => {

        socket.on("typing", (data: boolean, roomId: string, senderAvatar: string) => {
            setIsTyping(data)
            setRoomId(roomId)
            setSenderAvatar(senderAvatar)
        });

        socket.on("stopped-typing", (data: boolean, roomId: string) => {
            setIsTyping(data)
            setRoomId(roomId)
        });

        function handleBlockedUsers(recipientBlockedUsers: string[]) {
            setRecipientBlockedUsers(recipientBlockedUsers);
        }

        socket.on('recipientBlockedUsers', recipientBlockedUsers => {
            handleBlockedUsers(recipientBlockedUsers)
        });

        return () => {
            socket.off('recipientBlockedUsers', handleBlockedUsers);
            
        };
    }, [socket]);

    function onSheetOpen() {
        setSheetOpen(prev => !prev);
    };

    function handleUserTyping(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setMessage(e.target.value);
        socket.emit("typing", {
            roomId: conversation?._id,
            typing: true,
            senderAvatar: user.userAvatar
        })
    };

    const handleSubmit = (e: React.FocusEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newMessage: MessagesInterface = {
            sender: {
                _id: user.userId,
                username: user.username,
                userAvatar: user.userAvatar
            },
            content: message,
            createdAt: new Date().toISOString(),
        };

        // handle conversation submission here
        if (conversation?.conversationType == 'personal') {

            privateMessage(newMessage, recipientUser!._id, user.userId);
            dispatch({ type: 'UPDATE_CONVERSATIONS', payload: { conversationId: conversation._id, newMessage: newMessage } });
            dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
            setMessage('');

        } else if (conversation?.conversationType == 'group') {

            groupMessage(newMessage, conversation!._id);
            dispatch({ type: 'UPDATE_CONVERSATIONS', payload: { conversationId: conversation._id, newMessage: newMessage } });
            dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
            setMessage('');

        } else {
            // If there's no ConversationType it means that it is a new conversation
            privateMessage(newMessage, recipientUser!._id, user.userId);
            setMessage('');

            const messages_container = document.getElementById('messages_container');
            const message_notice = document.createElement('p');
            message_notice.className = 'text-slate-orange-500 dark:text-slate-50 text-center';
            message_notice.textContent = 'You started a conversation.';
            messages_container?.appendChild(message_notice);
        }
    };

    const sortMessages = conversation?.messages?.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    useEffect(() => {
        // Scroll to bottom when new message arrives
        if (newMessageRef.current!) {
            newMessageRef.current.scrollTo({
                top: newMessageRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }

    }, [sortMessages]);

    return (
        <section className={`${onClickConversation ? 'visible flex flex-col justify-between absolute w-screen h-svh top-0 right-0 bg-slate-100 dark:bg-slate-950 text-slate-50 z-50' : 'hidden'} sm:h-full sm:w-1/2 sm:flex sm:flex-col lg:flex-row sm:gap-2 lg:w-full sm:bg-gray-300 sm:dark:bg-gray-800`}>

            <div className="flex flex-col justify-between w-full h-full sm:dark:bg-slate-950 sm:bg-slate-100">
                <div className="flex gap-3 h-fit px-3 py-3 shadow-md bg-slate-100 dark:bg-slate-900 sm:dark:bg-slate-950 sm:dark:border-b-4 sm:dark:border-gray-800 sm:bg-slate-100">
                    {/* Back to Home Button */}
                    <div className="flex content-center sm:hidden">
                        <button onClick={onClick}>
                            <svg className="fill-orange-500" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                            </svg>
                        </button>
                    </div>
                    {/* Conversation Avatar */}
                    <div className="flex gap-3 items-center">
                        {conversation?.conversationType == 'personal' || conversation === null ?
                            <>
                                <Image className="w-10 h-10 rounded-full" imageSource={recipientUser?.userAvatar} imageOf="personal" />

                                <div className="flex flex-col content-center text-orange-500 dark:text-slate-50">
                                    <strong>{recipientUser?.username}</strong>
                                    <div className={`${recipientUser?.userStatus === 'online' ? 'text-green-500' : 'text-red-500'} flex items-center gap-1 h-min`}>
                                        <svg className={`${recipientUser?.userStatus === 'online' ? 'fill-green-500' : 'fill-red-500'} w-2 h-2`} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round">
                                            </g>
                                            <g id="SVGRepo_iconCarrier">
                                                <circle cx="6" cy="6" r="6" >
                                                </circle>
                                            </g>
                                        </svg>
                                        <small className={recipientUser?.userStatus === 'online' ? 'text-green-500' : 'text-red-500'}>{recipientUser?.userStatus}</small>
                                    </div>
                                </div>
                            </>
                            :
                            <>
                                <div className="">
                                    <Image className="w-10 h-10 rounded-full" imageSource={conversation?.groupAvatar} imageOf="group" />
                                </div>
                                <div className="text-orange-500 dark:text-slate-50">
                                    <strong>{conversation?.conversationName}</strong>
                                </div>
                            </>
                        }
                    </div>
                    {/* Conversation Information */}
                    <div className="flex content-center ml-auto">
                        <Sheet open={sheetOpen}>
                            <SheetTitle className='hidden'>Conversation Info</SheetTitle>
                            <SheetDescription className='hidden'>Show user the conversation Information</SheetDescription>
                            <SheetTrigger onClick={onSheetOpen} className="lg:hidden">
                                <svg className="fill-orange-500" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                                    <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
                                </svg>
                            </SheetTrigger>
                            <SheetContent side='right' className="flex flex-col bg-slate-100 dark:bg-slate-950 border-none w-full">
                                <SheetClose onClick={onSheetOpen}>
                                    <svg className="fill-orange-600 opacity-70 transition-opacity hover:opacity-100" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                                    </svg>
                                </SheetClose>
                                <ConversationInfo isHidden="" isUserBlocked={isUserBlocked} leaveConversation={onClick} onSheetOpen={onSheetOpen} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
                {/* Messages container */}
                <div id="messages_container" ref={newMessageRef} className={`flex flex-col overflow-y-auto no-scrollbar py-2 mt-auto px-4`}>
                    <button className={messagesLength! < 20 || conversation === null ? "hidden" : "text-gray-400 font-semibold flex justify-center pb-2"} onClick={loadMoreMessage} disabled={isLoading}>
                        {isLoading ?
                            <svg className='fill-orange-500' xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25" /><path fill="" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" dur="1.125s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" /></path>
                            </svg>
                            : 'Load more'}
                    </button>
                    {conversation?.conversationType == 'personal' ?
                        <>
                            {sortMessages && sortMessages.map((m, i) =>
                                <div key={i}>
                                    {m.sender._id === user.userId ?
                                        <div className={`ml-32`}>
                                            <p className={`text-slate-50 bg-orange-500 break-all w-fit text-wrap ml-auto left-0 p-2 my-[2px] rounded-bl-xl rounded-br-sm rounded-tl-xl rounded-tr-xl animate-append-animate`}>{m.content}</p>
                                        </div>
                                        :
                                        <div className="flex gap-3">
                                            <Image className="w-6 h-6 rounded-full mt-auto" imageSource={m.sender.userAvatar} imageOf="personal" />
                                            <p key={i} className={'text-slate-50 bg-orange-500 break-all w-fit text-wrap mr-auto max-w-64 p-2 my-[2px] rounded-bl-sm rounded-br-xl rounded-tl-xl rounded-tr-xl animate-append-animate'}>{m.content}</p>
                                        </div>
                                    }
                                </div>
                            )}
                        </>
                        :
                        <>
                            {sortMessages && sortMessages.map((m, i) =>
                                <div key={i}>
                                    {m.sender._id === user.userId ?
                                        <div className={`ml-32`}>
                                            <p className={`text-slate-50 bg-orange-500 break-all w-fit text-wrap ml-auto left-0 p-2 my-[2px] rounded-bl-xl rounded-br-sm rounded-tl-xl rounded-tr-xl animate-append-animate`}>{m.content}</p>
                                        </div>
                                        :
                                        <div className="flex gap-3">
                                            <Image className="w-6 h-6 rounded-full mt-auto" imageSource={m.sender.userAvatar} imageOf="personal" />
                                            <p key={i} className={'text-slate-50 bg-orange-500 break-all w-fit text-wrap mr-auto max-w-64 p-2 my-[2px] rounded-bl-sm rounded-br-xl rounded-tl-xl rounded-tr-xl animate-append-animate'}>{m.content}</p>
                                        </div>
                                    }
                                </div>
                            )}
                        </>
                    }
                    {isTyping && roomId === conversation?._id &&
                        <div className="flex gap-3 mt-3 mb-3">
                            <Image className="w-6 h-6 rounded-full mt-auto" imageSource={senderAvatar} imageOf="personal" />
                            <div className='flex space-x-1 justify-center items-center bg-orange-500 rounded-full h-min w-min py-2 px-3'>
                                <div className='h-1 w-1 bg-slate-50 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                                <div className='h-1 w-1 bg-slate-50 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                                <div className='h-1 w-1 bg-slate-50 rounded-full animate-bounce'></div>
                            </div>
                        </div>
                    }
                </div>
                {/* Send Message Form */}
                {conversation?.conversationType == "personal" ?
                    <>
                        {isUserBlocked || isCurrentUserBlocked || isCurrentUserGetBlocked ?
                            <div className="w-full">
                                <p className="text-center text-slate-500 dark:text-slate-400">You can't reply to this conversation.</p>
                            </div>
                            :
                            <form onSubmit={handleSubmit} className="flex justify-between items-center gap-2 h-13 px-4 py-2 bg-white dark:bg-slate-900 w-full sm:dark:bg-gray-800">
                                <textarea className="w-full rounded-lg px-2 py-1 h-7 text-wrap text-xs text-slate-600 bg-gray-200 border-2 outline-none focus-visible:border-orange-500"
                                    placeholder="Message"
                                    value={message}
                                    onChange={handleUserTyping}
                                    wrap="soft"
                                    required
                                />
                                <Button variant={'ghost'} className="w-fit p-0" disabled={(conversation === null && recipientUser === null) ? true : false}>
                                    <svg className="fill-orange-500" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                                        <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                                    </svg>
                                </Button>
                            </form>
                        }
                    </>
                    :
                    <>
                        <form onSubmit={handleSubmit} className="flex justify-between items-center gap-2 h-13 px-4 py-2 bg-white dark:bg-slate-900 w-full sm:dark:bg-gray-800">
                            <textarea className="w-full rounded-lg px-2 py-1 h-7 text-wrap text-xs text-slate-600 bg-gray-200 border-2 outline-none focus-visible:border-orange-500"
                                placeholder="Message"
                                value={message}
                                onChange={handleUserTyping}
                                wrap="soft"
                                required
                            />
                            <Button variant={'ghost'} className="w-fit p-0" disabled={conversation === null}>
                                <svg className="fill-orange-500" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                                    <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                                </svg>
                            </Button>
                        </form>
                    </>
                }

            </div>
            <ConversationInfo isHidden="hidden lg:block lg:visible" isUserBlocked={isUserBlocked} leaveConversation={onClick} onSheetOpen={onSheetOpen} />
        </section>
    )
}