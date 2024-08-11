import { useState, useEffect, useRef } from "react";
// Context Hooks
import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from '../context/AuthContext';
// Assets
import blankAvatar from '../assets/avatar/blank avatar.jpg';
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
    const [message, setMessage] = useState<string>('')
    const newMessageRef = useRef<HTMLDivElement>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const isUserBlocked: boolean | null = blockedUsers!.some(blockedUser => blockedUser._id === recipientUser?._id);

    function onSheetOpen() {
        setSheetOpen(prev => !prev);
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

        }
    };

    const sortMessages = conversation?.messages!.sort((a, b) => {
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
        <section className={onClickConversation ? 'visible flex flex-col justify-between absolute top-0 w-full h-full bg-white dark:bg-slate-950 text-slate-50 z-50' : 'hidden'}>
            <div className="flex gap-3 h-fit px-3 py-3 shadow-md bg-white dark:bg-slate-900">
                {/* Back to Home Button */}
                <div className="flex content-center">
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
                            <img className="w-10 h-10 rounded-full" src={recipientUser?.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${recipientUser?.userAvatar}`} />

                            <div className="flex content-center text-orange-500 dark:text-slate-50">
                                <strong>{recipientUser?.username}</strong>
                            </div>
                        </>
                        :
                        <>
                            <div className="">
                                <img className="w-10 h-10 rounded-full" src={conversation?.groupAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${conversation?.groupAvatar}`} />
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
                        <SheetTrigger onClick={onSheetOpen}>
                            <svg className="fill-orange-500" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                                <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
                            </svg>
                        </SheetTrigger>
                        <SheetContent side='right' className="dark:bg-gray-800 border-none w-full">
                            <SheetClose onClick={onSheetOpen}>
                                <svg className="fill-orange-600 opacity-70 transition-opacity hover:opacity-100" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                                </svg>
                            </SheetClose>
                            <ConversationInfo isUserBlocked={isUserBlocked} leaveConversation={onClick} onSheetOpen={onSheetOpen} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            {/* Messages container */}
            <div ref={newMessageRef} className={`flex flex-col overflow-y-auto mt-auto px-4`}>
                {conversation?.conversationType == 'personal' ?
                    <>
                        {sortMessages && sortMessages.map((m, i) =>
                            <div key={i}>
                                {m.sender._id === user.userId ?
                                    <div className={`ml-32`}>
                                        <p className={`bg-orange-500 break-all w-fit text-wrap ml-auto left-0 p-2 my-[2px] rounded-bl-xl rounded-br-sm rounded-tl-xl rounded-tr-xl`}>{m.content}</p>
                                    </div>
                                    :
                                    <div className="flex gap-3">
                                        <img className="w-6 h-6 rounded-full mt-auto" src={m.sender.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${m.sender.userAvatar}`} />
                                        <p key={i} className={'bg-orange-500 break-all w-fit text-wrap mr-auto max-w-64 p-2 my-[2px] rounded-bl-sm rounded-br-xl rounded-tl-xl rounded-tr-xl'}>{m.content}</p>
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
                                    <div className="ml-10">
                                        <p className={'bg-orange-500 break-all w-fit text-wrap ml-auto left-0 p-2 my-[2px] rounded-bl-lg rounded-tl-lg rounded-tr-lg'}>{m.content}</p>
                                    </div>
                                    :
                                    <div className="flex gap-1">
                                        <img className="w-6 h-6 rounded-full mt-auto" src={m.sender.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${m.sender.userAvatar}`} />
                                        <p key={i} className={'bg-orange-500 break-all text-wrap text-right mr-auto w-fit max-w-64 p-2 my-[2px] rounded-br-lg rounded-tl-lg rounded-tr-lg'}>{m.content}</p>
                                    </div>
                                }
                            </div>
                        )}
                    </>
                }
            </div>
            {/* Send Message Form */}
            {!isUserBlocked ?
                <form onSubmit={handleSubmit} className="flex justify-between items-center gap-2 h-13 px-4 py-2 mt-3 shadow-md bg-white dark:bg-slate-900 w-full">
                    <textarea className="w-full rounded-lg px-2 h-7 text-wrap text-slate-600 bg-gray-200 border-2 outline-none focus-visible:border-orange-500"
                        placeholder="Message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        wrap="soft"
                        required
                    />
                    <Button variant={'ghost'} className="w-fit p-0">
                        <svg className="fill-orange-500" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                            <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                        </svg>
                    </Button>
                </form>
                :
                <div className="w-full">
                    <p className="text-center text-slate-500 dark:text-slate-400">This user is currently blocked.</p>
                </div>
            }

        </section>
    )
}