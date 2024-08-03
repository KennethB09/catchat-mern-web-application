// Hooks
import { useState, useEffect } from 'react';

// Components
import ConversationList from '../components/ConversationsList';
import Conversation from "../components/Conversation";
import Header from '../components/Header';
// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Context Hooks
import { useSocket } from '../context/SocketContext';
import { useAuthContext } from '../context/AuthContext';
import { useConversationContext } from '../context/ConversationContext';

// Interfaces
import { ConversationInterface, userInterface } from '../ts/interfaces/Conversation_interface';

export default function Home() {

    const socket = useSocket();
    const { user } = useAuthContext();
    const { conversations, dispatch } = useConversationContext();
    const [isOnline, setIsOnline] = useState<userInterface[] | null>(null);
    const [onClickConversation, setOnClickConversation] = useState(false);

    function onClick() {
        setOnClickConversation(prev => !prev);
    };

    useEffect(() => {

        const fetchData = async () => {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversations`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_CONVERSATIONS', payload: data })
            }
        }

        if (user) {
            fetchData();
        }

    }, [user]);

    
    useEffect(() => {

        socket.on('currentUserOnline', (state: boolean) => {
            if (state) {
                socket.emit('isOnline', user.userId)
            } else {
                socket.emit('isOffline', user.userId)
            }
        });

        socket.on('onlineContacts', (onlineUsers: userInterface[]) => {
            setIsOnline(onlineUsers);
        });

    }, [socket])

    return (
        <div className='h-screen'>
            <Header onlineUsers={isOnline} onClickUser={onClick} />
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

            <Conversation onClickConversation={onClickConversation} onClick={onClick} />

        </div>
    );
}