import { socket } from '../socket';
// Context
import { useAuthContext } from '../context/AuthContext';
import Image from './Image';
import { format } from 'date-fns';
// Interfaces
import { ConversationInterface, participantsInterface, userInterface } from '../ts/interfaces/Conversation_interface';
import { useEffect, useState } from 'react';

interface ConversationListProps {
  conversation: ConversationInterface;
  onClickConversation: (conversationType: string, recipientUser: userInterface, conversation: ConversationInterface) => void;
}

export default function ConversationList({ conversation, onClickConversation }: ConversationListProps) {

  const { user } = useAuthContext();
  const conversationType = conversation.conversationType;
  const recipientUser: participantsInterface[] = conversation.participants.filter(participant => participant.user._id !== user.userId);
  const [isTyping, setIsTyping] = useState(false);
  const [roomId, setRoomId] = useState<string>("");

  const newMessage = conversation.messages?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const avatar = conversation.participants.filter(u => u.user._id.toString() !== user.userId.toString());

  function conversationClick() {
    onClickConversation(conversationType, recipientUser[0]?.user, conversation);
  };

  useEffect(() => {
    socket.on("typing", (data: boolean, roomId: string) => {
      setIsTyping(data)
      setRoomId(roomId)
    });

    socket.on("stopped-typing", (data: boolean, roomId: string) => {
      setIsTyping(data)
      setRoomId(roomId)
    });
  }, [socket])

  return (
    <div onClick={conversationClick} className='flex items-center p-2 h-min hover:bg-gray-300 dark:hover:bg-slate-800 cursor-pointer rounded-md'>
      {conversation.conversationType == 'personal' ? (
        <>
          <div className=''>
            <Image className="w-16 rounded-full" alt='user avatar' imageSource={avatar[0].user.userAvatar} imageOf='personal' />
          </div>
          <div className='ml-4 w-full'>
            <div className='text-gray-700 dark:text-slate-50'>
              <strong>{recipientUser[0].user.username}</strong>
            </div>
            {newMessage![0] && (
              <div className='grid grid-cols-2 w-full text-slate-500'>
                <div className='w-full'>
                  {isTyping && roomId === conversation?._id ?
                    <div className='flex space-x-1 justify-center items-center rounded-full h-min w-min py-2 px-3 bg-gray-200 dark:bg-slate-700'>
                      <div className='h-1 w-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                      <div className='h-1 w-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                      <div className='h-1 w-1 bg-slate-500 rounded-full animate-bounce'></div>
                    </div>
                    :
                    <p className='text-ellipsis whitespace-nowrap overflow-hidden'>{newMessage![0].sender._id === user.userId ? 'You: ' + newMessage![0].content : newMessage![0].content}</p>
                  }
                </div>
                <span className='whitespace-nowrap ml-auto'>{format(new Date(newMessage![0].createdAt), 'h:mm a')}</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className=''>
            <Image className="w-16 rounded-full" alt='group avatar' imageSource={conversation.groupAvatar} imageOf='group' />
          </div>
          <div className='ml-4 w-full'>
            <div className='text-gray-700 dark:text-slate-50'>
              <strong>{conversation.conversationName}</strong>
            </div>
            {newMessage![0] && (
              <div className='grid grid-cols-2 w-full text-slate-500'>
                <div className='w-full'>
                {isTyping && roomId === conversation?._id ?
                    <div className='flex space-x-1 justify-center items-center rounded-full h-min w-min py-2 px-3 bg-gray-200 dark:bg-slate-700'>
                      <div className='h-1 w-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                      <div className='h-1 w-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                      <div className='h-1 w-1 bg-slate-500 rounded-full animate-bounce'></div>
                    </div>
                    :
                    <p className='text-ellipsis whitespace-nowrap overflow-hidden'>{newMessage![0].sender._id === user.userId ? 'You: ' + newMessage![0].content : newMessage![0].content}</p>
                  }
                </div>
                <span className='whitespace-nowrap ml-auto'>{format(new Date(newMessage![0].createdAt), 'h:mm a')}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}