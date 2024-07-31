// Hooks
import { useState, useEffect } from 'react';

// Components
import ConversationList from '../components/ConversationsList';
import Conversation from "../components/Conversation";
import Header from '../components/Header';
// Shadcn Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Context Hooks
import { useSocket } from '../context/SocketContext';
import { useAuthContext } from '../context/AuthContext';
import { useConversationContext } from '../context/ConversationContext';

// Interfaces
import { ConversationInterface } from '../ts/interfaces/Conversation_interface';

interface onlineUsersInterface {
    userId: string;
    username: string;
    userAvatar: string;
    online: boolean;
}

export default function Home() {

    const socket = useSocket();
    const { user } = useAuthContext();
    const { conversations, dispatch } = useConversationContext();
    const [isOnline, setIsOnline] = useState<onlineUsersInterface[] | null>(null);
    const [onClickConversation, setOnClickConversation] = useState(false);

    function onClick() {
        setOnClickConversation(prev => !prev)
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

    }, [user, socket.on]);


    useEffect(() => {
        socket.on('currentUserOnline', isTrue => {
            if (isTrue) {
                socket.emit('isOnline', user.userId)
            }
        });

        socket.on('userOnlineStatus', (onlineUsers: onlineUsersInterface[]) => {
            setIsOnline(onlineUsers);
        });
    }, [socket.on])

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