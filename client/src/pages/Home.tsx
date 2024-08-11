import { socket } from '../socket';
// Hooks
import { useState, useEffect } from 'react';
// Components
import ConversationList from '../components/ConversationsList';
import Conversation from "../components/Conversation";
import Header from '../components/Header';
import Contacts from '@/components/Contacts';
// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
// Context Hooks
import { useAuthContext } from '../context/AuthContext';
import { useConversationContext } from '../context/ConversationContext';
import { useToastContext } from '@/hooks/useToast';
// Interfaces
import { ConversationInterface, MessagesInterface, userInterface } from '../ts/interfaces/Conversation_interface';

export default function Home() {

    const { user } = useAuthContext();
    const { conversations, dispatch } = useConversationContext();
    const [isOnline, setIsOnline] = useState<userInterface[] | null>(null);
    const [onClickConversation, setOnClickConversation] = useState(false);
    const { toast } = useToastContext();

    // Toggle function to show the Conversation component
    function onClick() {
        setOnClickConversation(prev => !prev);
    };

    // Function to send a private message
    function privateMessage(newMessage: MessagesInterface, recipientId: string, senderId: string) {
        socket.emit('private message', newMessage, recipientId, senderId);
    };

    // Function to send a group message
    function groupMessage(newMessage: MessagesInterface, conversationId: string) {
        socket.emit('group message', newMessage, conversationId);
    };

    useEffect(() => {

        // Fetch the conversations of the user
        const fetchData = async () => {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversations`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_CONVERSATIONS', payload: data });
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
            }
        };

        if (user) {
            fetchData();
            fetchBlockedUsersData();
            socket.connect();
        }

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
        
        // Execute when new message received
        function handleMessageReceive(msg: MessagesInterface, conversationId: string) {
            dispatch({ type: 'UPDATE_CONVERSATIONS', payload: { conversationId: conversationId, newMessage: msg} });
            dispatch({ type: 'ADD_MESSAGE', payload: msg });

            // Check if the user is inside of conversation
            // If the onClickConversation is false then it will send a notification
            if (onClickConversation === false) {
               return toast({ title: msg.sender.username, description: msg.content, variant: 'default' });
            }
        };

        // Listen to the messageReceive event from server
        socket.on('messageReceive', handleMessageReceive);

        return () => {
            socket.off('messageReceive', handleMessageReceive);
        };
    }, []);

    // Emit the Ids of user conversation to server
    // And the server will convert the Ids to room names
    useEffect(() => {

        const conversationIds = conversations?.map(c => c._id)
        socket.emit('join conversations', conversationIds);

    }, [conversations]);

    // The socket.on 'connect' will call the isOnlineAndJoinChats function to emit
    // the current user Id to server and the server will update the user status to Online.
    // The socket.on 'onlineContacts' will get the user contacts that is online.
    useEffect(() => {

        function isOnlineAndJoinChats() {
            socket.emit('isOnline', user.userId);
            
        };

        socket.on('connect', isOnlineAndJoinChats);

        socket.on('onlineContacts', (onlineUsers: userInterface[]) => {
            setIsOnline(onlineUsers);
        });

        return () => {
           
            socket.off('connect', isOnlineAndJoinChats);
            socket.off('onlineContacts');

        };
    }, []);

    return (
        <div className='flex flex-col h-screen bg-white dark:bg-slate-950'>
            <Toaster />
            <Header onlineUsers={isOnline} onClickUser={onClick} />

            <Tabs defaultValue='chats' className='relative flex flex-col w-full h-full z-0'>

                <TabsContent value='chats' className='h-full'>
                    <Tabs defaultValue='personal' className='px-4'>

                        <TabsList className='w-full mb-4 bg-gray-200 dark:bg-slate-600'>

                            <TabsTrigger value='personal' className='w-1/2 data-[state=active]:bg-orange-500 data-[state=active]:text-slate-50'>Personal</TabsTrigger>
                            <TabsTrigger value='group' className='w-1/2 data-[state=active]:bg-orange-500 data-[state=active]:text-slate-50'>Group</TabsTrigger>

                        </TabsList>
                        <TabsContent value='personal'>

                            {conversations && conversations.map((c: ConversationInterface) => {
                                return (c.conversationType == 'personal' && (
                                    <ConversationList key={c._id} conversation={c} onClickConversation={onClick} />)
                                )
                            }
                            )}

                        </TabsContent>
                        <TabsContent value='group'>

                            {conversations && conversations.map((c: ConversationInterface) => {
                                return (c.conversationType == 'group' && (
                                    <ConversationList key={c._id} conversation={c} onClickConversation={onClick} />)
                                )
                            }
                            )}

                        </TabsContent>

                    </Tabs>
                </TabsContent>

                <TabsContent value='contacts' className='h-full'>

                    <Contacts />

                </TabsContent>

                <TabsList className='w-full h-max p-1 rounded-none bg-gray-200 dark:bg-slate-900'>

                    <TabsTrigger value='chats' className='flex flex-col gap-1 w-1/2 data-[state=active]:bg-gray-200 dark:bg-slate-900 data-[state=active]:fill-orange-500 dark:data-[state=active]:fill-orange-500 fill-slate-600 text-slate-600 dark:fill-slate-50 dark:text-slate-50 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-500'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 15 15">
                            <path d="m11.5 13.5l.157-.475l-.218-.072l-.197.119zm2-2l-.421-.27l-.129.202l.076.226zm1 2.99l-.157.476a.5.5 0 0 0 .631-.634zm-3.258-1.418c-.956.575-2.485.919-3.742.919v1c1.385 0 3.106-.37 4.258-1.063zM7.5 13.99c-3.59 0-6.5-2.908-6.5-6.496H0a7.498 7.498 0 0 0 7.5 7.496zM1 7.495A6.498 6.498 0 0 1 7.5 1V0A7.498 7.498 0 0 0 0 7.495zM7.5 1C11.09 1 14 3.908 14 7.495h1A7.498 7.498 0 0 0 7.5 0zM14 7.495c0 1.331-.296 2.758-.921 3.735l.842.54C14.686 10.575 15 8.937 15 7.495zm-2.657 6.48l3 .99l.314-.949l-3-.99zm3.631.357l-1-2.99l-.948.316l1 2.991z" />
                        </svg>
                        <small>Chats</small>
                    </TabsTrigger>

                    <TabsTrigger value='contacts' className='flex flex-col gap-1 w-1/2 data-[state=active]:bg-gray-200 dark:bg-slate-900 data-[state=active]:fill-orange-500 dark:data-[state=active]:fill-orange-500 fill-slate-600 text-slate-600 dark:fill-slate-50 dark:text-slate-50 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-500'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 15 15">
                            <path d="M5.5 11.5H5v.5h.5zm5 0v.5h.5v-.5zm-4.5 0V11H5v.5zm4-.5v.5h1V11zm.5 0h-5v1h5zM8 9a2 2 0 0 1 2 2h1a3 3 0 0 0-3-3zm-2 2a2 2 0 0 1 2-2V8a3 3 0 0 0-3 3zm2-8a2 2 0 0 0-2 2h1a1 1 0 0 1 1-1zm2 2a2 2 0 0 0-2-2v1a1 1 0 0 1 1 1zM8 7a2 2 0 0 0 2-2H9a1 1 0 0 1-1 1zm0-1a1 1 0 0 1-1-1H6a2 2 0 0 0 2 2zM3.5 1h9V0h-9zm9.5.5v12h1v-12zM12.5 14h-9v1h9zM3 13.5v-12H2v12zm.5.5a.5.5 0 0 1-.5-.5H2A1.5 1.5 0 0 0 3.5 15zm9.5-.5a.5.5 0 0 1-.5.5v1a1.5 1.5 0 0 0 1.5-1.5zM12.5 1a.5.5 0 0 1 .5.5h1A1.5 1.5 0 0 0 12.5 0zm-9-1A1.5 1.5 0 0 0 2 1.5h1a.5.5 0 0 1 .5-.5zM4 4H1v1h3zm0 6H1v1h3z" />
                        </svg>
                        <small>Contacts</small>
                    </TabsTrigger>
                </TabsList>

            </Tabs>

            <Conversation onClickConversation={onClickConversation} onClick={onClick} privateMessage={privateMessage} groupMessage={groupMessage}/>

        </div>
    );
}