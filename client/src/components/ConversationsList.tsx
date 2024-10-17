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
                    <div className='flex space-x-1 justify-center items-center rounded-full h-min w-min px-3 bg-gray-200 dark:bg-slate-700'>
                      <svg className='fill-slate-500 h-4' fill="hsl(228, 97%, 42%)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="4" cy="12" r="3"><animate id="spinner_qFRN" begin="0;spinner_OcgL.end+0.25s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" /></circle>
                        <circle cx="12" cy="12" r="3"><animate begin="spinner_qFRN.begin+0.1s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" /></circle>
                        <circle cx="20" cy="12" r="3"><animate id="spinner_OcgL" begin="spinner_qFRN.begin+0.2s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" /></circle>
                      </svg>
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
                    <div className='flex space-x-1 justify-center items-center rounded-full h-min w-min px-3 bg-gray-200 dark:bg-slate-700'>
                      <svg className='fill-slate-500 h-4' fill="hsl(228, 97%, 42%)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="4" cy="12" r="3"><animate id="spinner_qFRN" begin="0;spinner_OcgL.end+0.25s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" /></circle>
                        <circle cx="12" cy="12" r="3"><animate begin="spinner_qFRN.begin+0.1s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" /></circle>
                        <circle cx="20" cy="12" r="3"><animate id="spinner_OcgL" begin="spinner_qFRN.begin+0.2s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" /></circle>
                      </svg>
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