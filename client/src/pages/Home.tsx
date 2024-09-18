import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
// Hooks
import { useState, useEffect, useRef } from 'react';
// Components
import ConversationList from '../components/ConversationsList';
import Conversation from "../components/Conversation";
import Header from '../components/Header';
import Contacts from '@/components/Contacts';
// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
// Context Hooks
import { useAuthContext } from '../context/AuthContext';
import { useConversationContext } from '../context/ConversationContext';
import { useToastContext } from '@/hooks/useToast';
import { useLogout } from '@/hooks/useLogout';
// Interfaces
import { ConversationInterface, MessagesInterface, userInterface } from '../ts/interfaces/Conversation_interface';

export default function Home() {

    const { user } = useAuthContext();
    const { conversations, dispatch } = useConversationContext();
    const [isLoading, setIsLoading] = useState(false);
    const [isConversationLoading, setIsConversationLoading] = useState(false);
    const [isOnline, setIsOnline] = useState<userInterface[] | null>(null);
    const [isOnlineLoading, setIsOnlineLoading] = useState(false);
    const [onClickConversation, setOnClickConversation] = useState(false);
    const [currentConversation, setCurrentConversation] = useState('');
    const { toast } = useToastContext();
    const viewport = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { logout } = useLogout();

    // Toggle function to show the Conversation component
    function onClick() {
        setOnClickConversation(prev => !prev);
        setCurrentConversation('');
    };

    // Function to send a private message
    function privateMessage(newMessage: MessagesInterface, recipientId: string, senderId: string) {
        socket.emit('private message', newMessage, recipientId, senderId);
    };

    // Function to send a group message
    function groupMessage(newMessage: MessagesInterface, conversationId: string) {
        socket.emit('group message', newMessage, conversationId);
    };

    function clickedConversation(conversationType: string, recipientUser: userInterface, conversation: ConversationInterface) {

        if (viewport.current!.clientWidth < 640) {
            onClick();
        };

        socket.emit('checkBlockedUser', recipientUser?._id);

        if (conversationType == 'personal') {
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: conversation });
            dispatch({ type: 'SET_USER', payload: recipientUser });
            setCurrentConversation(conversation._id);
        } else if (conversationType === 'new_conversation') {
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: conversation });
            dispatch({ type: 'SET_USER', payload: recipientUser });
        } else {
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: conversation });
            setCurrentConversation(conversation._id);
        }
    };

    useEffect(() => {

        // Fetch the conversations of the user
        const fetchData = async () => {
            setIsConversationLoading(true);
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversations`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_CONVERSATIONS', payload: data });
                setIsConversationLoading(false);
            } else {
                switch (data.status) {
                    case 440:
                        logout()
                        navigate('/login')
                        return
                    default:
                }
                toast({
                    title: "Ops, something went wrong",
                    description: data.error,
                    variant: 'destructive'
                });
                setIsConversationLoading(false);
            }
        };

        // Fetch the blocked users of user
        const fetchBlockedUsersData = async () => {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/user-blocked-users`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'USER_BLOCKED_USERS', payload: data })
            } else {
                toast({
                    title: "Ops, something went wrong",
                    description: data.error,
                    variant: 'destructive'
                });
            }
        };

        if (user) {
            fetchData();
            fetchBlockedUsersData();
        };

    }, [user]);

    // Connect to Socket Server
    useEffect(() => {
        console.log('client connect')
        socket.connect();

        return () => {
            console.log('Client Disconnect')
            socket.disconnect();
        }
    }, []);
    
    useEffect(() => {

        function newRoom(conversation: ConversationInterface) {
            console.log('working')
            dispatch({ type: 'NEW_CONVERSATION', payload: conversation});
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: conversation });
            toast({
                title: 'Room created',
                description: 'You and this user are now connected',
                variant: 'default'
            });
        };

        function newConversation(msg: MessagesInterface, conversation: ConversationInterface) {
            toast({
                title: 'Someone send you a message',
                description: msg.content,
                variant: 'default'
            });
            dispatch({ type: 'NEW_CONVERSATION', payload: conversation});
            dispatch({ type: 'ADD_MESSAGE', payload: msg });
        };

        // Execute when new message received
        function handleMessageReceive(msg: MessagesInterface, conversationId: string) {
            dispatch({ type: 'UPDATE_CONVERSATIONS', payload: { conversationId: conversationId, newMessage: msg } });

            if(currentConversation === conversationId) {
                dispatch({ type: 'ADD_MESSAGE', payload: msg });
            } else {
                toast({ title: msg.sender.username, description: msg.content, variant: 'default' });
            }
        };

        socket.on('room_created', newRoom);

        socket.on('message_request', newConversation);

        // Listen to the messageReceive event from server
        socket.on('messageReceive', handleMessageReceive);

        return () => {
            socket.off('room_created', newRoom);
            socket.off('message_request', newConversation);
            socket.off('messageReceive', handleMessageReceive);
        };

    }, [currentConversation, socket.on]);

    // Emit the Ids of user conversation to server
    // And the server will convert the Ids to room names
    useEffect(() => {

        const conversationIds = conversations?.map(c => c._id)
        conversationIds?.push(user.userId);
        socket.emit('join conversations', conversationIds);

    }, [conversations]);

    // The socket.on 'connect' will call the isOnlineAndJoinChats function to emit
    // the current user Id to server and the server will update the user status to Online.
    // The socket.on 'onlineContacts' will get the user contacts that is online.
    useEffect(() => {

        function isOnlineAndJoinChats() {
            socket.emit('isOnline', user.userId);
            setIsOnlineLoading(true);
        };

        socket.on('connect', isOnlineAndJoinChats);

        socket.on('onlineContacts', (onlineUsers: userInterface[]) => {
            setIsOnline(onlineUsers);
            setIsOnlineLoading(false);
        });

        return () => {

            socket.off('connect', isOnlineAndJoinChats);
            socket.off('onlineContacts');

        };
    }, [socket.connect()]);

    return (
        <main ref={viewport} className='relative no-scrollbar overflow-scroll flex flex-col h-svh w-screen text-sm sm:p-2 sm:flex-row sm:gap-2 sm:bg-gray-300 sm:dark:bg-gray-800 font-roboto'>

            {isLoading &&
                <span className='absolute w-full h-full right-0 self-center flex flex-col items-center justify-center top-0 bg-gray-700 bg-opacity-10 z-50'>
                    <svg className='fill-orange-500' xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25" /><path fill="" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" dur="1.125s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" /></path>
                    </svg>
                </span>
            }

            <div className='flex flex-col h-full w-full sm:w-1/2 lg:w-[35%] p-4 sm:p-2 bg-slate-100 dark:bg-slate-950 sm:rounded-bl-md sm:rounded-tl-md'>
                <Header onlineUsers={isOnline} onClickUser={onClick} isOnlineLoading={isOnlineLoading} clickedConversation={clickedConversation} setIsLoading={setIsLoading}/>

                <Tabs defaultValue='chats' className='no-scrollbar overflow-scroll flex flex-col h-full z-0 '>

                    <TabsContent value='chats' className='flex flex-col'>

                        <Tabs defaultValue='personal' className='h-full no-scrollbar overflow-y-scroll'>

                            <TabsList className='w-full mb-4 bg-gray-200 dark:bg-slate-600 font-bold'>

                                <TabsTrigger value='personal' className='w-1/2 data-[state=active]:bg-orange-500 data-[state=active]:text-slate-50'>Personal</TabsTrigger>
                                <TabsTrigger value='group' className='w-1/2 data-[state=active]:bg-orange-500 data-[state=active]:text-slate-50'>Group</TabsTrigger>

                            </TabsList>

                            <TabsContent value='personal' className='h-full'>

                                {!isConversationLoading ?
                                    <>
                                        {conversations && conversations.map((c: ConversationInterface) => {
                                            return (c.conversationType == 'personal' && (
                                                <ConversationList key={c._id} conversation={c} onClickConversation={clickedConversation}/>)
                                            )
                                        }
                                        )}
                                    </>
                                    :
                                    <>
                                        {'123456'.split('').map(i => (
                                            <div key={i} className='flex p-2 max-h-14'>
                                                <Skeleton className="bg-slate-300 dark:bg-slate-800 min-w-12 h-12 rounded-full" />
                                                <div className='ml-4 flex flex-col justify-between w-full'>

                                                    <Skeleton className="bg-slate-300 dark:bg-slate-800 w-full h-4 rounded-full" />

                                                    <div className='grid grid-cols-2 w-full text-slate-500'>
                                                        <Skeleton className="bg-slate-300 dark:bg-slate-800 w-full h-4 rounded-full" />
                                                        <Skeleton className="bg-slate-300 dark:bg-slate-800 w-1/2 h-4 rounded-full ml-auto" />
                                                    </div>

                                                </div>
                                            </div>
                                        ))
                                        }
                                    </>
                                }

                            </TabsContent>
                            <TabsContent value='group'>

                                <div className='h-max'>
                                    {conversations && conversations.map((c: ConversationInterface) => {
                                        return (c.conversationType == 'group' && (
                                            <ConversationList key={c._id} conversation={c} onClickConversation={clickedConversation}/>)
                                        )
                                    }
                                    )}
                                </div>

                            </TabsContent>

                        </Tabs>

                    </TabsContent>

                    <TabsContent value='contacts' className='h-full'>

                        <Contacts contactClick={clickedConversation} />

                    </TabsContent>

                    <TabsList className='absolute w-1/2 sm:w-[20%] lg:w-[10%] h-max p-1 self-center bottom-7 rounded-xl bg-gray-400 bg-opacity-20 backdrop-blur-sm dark:bg-slate-900 dark:bg-opacity-80 dark:backdrop-blur-sm'>

                        <TabsTrigger value='chats' className='flex flex-col gap-1 w-1/2  dark:data-[state=active]:bg-transparent data-[state=active]:bg-transparent data-[state=active]:fill-orange-500 dark:data-[state=active]:fill-orange-500 fill-slate-600 text-slate-600 dark:fill-slate-50 dark:text-slate-50 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-500'>
                            <svg className='sm:w-5' xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 15 15">
                                <path d="m11.5 13.5l.157-.475l-.218-.072l-.197.119zm2-2l-.421-.27l-.129.202l.076.226zm1 2.99l-.157.476a.5.5 0 0 0 .631-.634zm-3.258-1.418c-.956.575-2.485.919-3.742.919v1c1.385 0 3.106-.37 4.258-1.063zM7.5 13.99c-3.59 0-6.5-2.908-6.5-6.496H0a7.498 7.498 0 0 0 7.5 7.496zM1 7.495A6.498 6.498 0 0 1 7.5 1V0A7.498 7.498 0 0 0 0 7.495zM7.5 1C11.09 1 14 3.908 14 7.495h1A7.498 7.498 0 0 0 7.5 0zM14 7.495c0 1.331-.296 2.758-.921 3.735l.842.54C14.686 10.575 15 8.937 15 7.495zm-2.657 6.48l3 .99l.314-.949l-3-.99zm3.631.357l-1-2.99l-.948.316l1 2.991z" />
                            </svg>
                            <small className='sm:text-xs'>Chats</small>
                        </TabsTrigger>

                        <TabsTrigger value='contacts' className='flex flex-col gap-1 w-1/2 dark:data-[state=active]:bg-transparent data-[state=active]:bg-transparent data-[state=active]:fill-orange-500 dark:data-[state=active]:fill-orange-500 fill-slate-600 text-slate-600 dark:fill-slate-50 dark:text-slate-50 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-500'>
                            <svg className='sm:w-5' xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 15 15">
                                <path d="M5.5 11.5H5v.5h.5zm5 0v.5h.5v-.5zm-4.5 0V11H5v.5zm4-.5v.5h1V11zm.5 0h-5v1h5zM8 9a2 2 0 0 1 2 2h1a3 3 0 0 0-3-3zm-2 2a2 2 0 0 1 2-2V8a3 3 0 0 0-3 3zm2-8a2 2 0 0 0-2 2h1a1 1 0 0 1 1-1zm2 2a2 2 0 0 0-2-2v1a1 1 0 0 1 1 1zM8 7a2 2 0 0 0 2-2H9a1 1 0 0 1-1 1zm0-1a1 1 0 0 1-1-1H6a2 2 0 0 0 2 2zM3.5 1h9V0h-9zm9.5.5v12h1v-12zM12.5 14h-9v1h9zM3 13.5v-12H2v12zm.5.5a.5.5 0 0 1-.5-.5H2A1.5 1.5 0 0 0 3.5 15zm9.5-.5a.5.5 0 0 1-.5.5v1a1.5 1.5 0 0 0 1.5-1.5zM12.5 1a.5.5 0 0 1 .5.5h1A1.5 1.5 0 0 0 12.5 0zm-9-1A1.5 1.5 0 0 0 2 1.5h1a.5.5 0 0 1 .5-.5zM4 4H1v1h3zm0 6H1v1h3z" />
                            </svg>
                            <small className='sm:text-xs'>Contacts</small>
                        </TabsTrigger>

                    </TabsList>

                </Tabs>
            </div>

            <Conversation onClickConversation={onClickConversation} onClick={onClick} privateMessage={privateMessage} groupMessage={groupMessage} />

        </main>
    );
}