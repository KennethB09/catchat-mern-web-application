// Context
import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

import { format } from 'date-fns';

import blankAvatar from '../assets/avatar/blank avatar.jpg'

// Interfaces
import { userInterface, ConversationInterface } from '../ts/interfaces/Conversation_interface';

interface ConversationListProps {
  conversation: ConversationInterface;
  onClickConversation: () => void;
}

export default function ConversationList({ conversation, onClickConversation }: ConversationListProps) {

  const { socket } = useSocket();

  const { dispatch } = useConversationContext();
  const { user } = useAuthContext();

  const username: userInterface[] = conversation.participants.filter(participant => participant._id !== user.userId);
  const newMessage = conversation.messages?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })
  const avatar = conversation.participants.filter(u => u._id.toString() !== user.userId.toString());

  function conversationClick() {
    onClickConversation();
    socket?.emit('conversation click', conversation._id)
    if (conversation.conversationType == 'personal') {
      dispatch({ type: 'MESSAGES', payload: conversation.messages! });
      dispatch({ type: 'SET_CLICK_CONVERSATION', payload: conversation });
      dispatch({ type: 'SET_USER', payload: username[0] });
    } else if(conversation.conversationType == 'group') {
      dispatch({ type: 'MESSAGES', payload: conversation.messages! });
      dispatch({ type: 'SET_CLICK_CONVERSATION', payload: conversation });
    }
  };

  return (
    <div onClick={conversationClick} className='flex p-2 h-14 hover:bg-gray-200 dark:hover:bg-slate-800 cursor-pointer'>
      {conversation.conversationType == 'personal' ? (
        <>
          <div className='aspect-square'>
            <img className="w-full h-full rounded-full" src={avatar[0].userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${avatar[0].userAvatar}`} />
          </div>
          <div className='ml-4 w-full'>
            <div className='text-orange-500 dark:text-slate-50'>
              <strong>{username[0].username}</strong>
            </div>
            {newMessage![0] && (
              <div className='grid grid-cols-2 text-slate-500 w-full'>
                <p className='text-ellipsis whitespace-nowrap overflow-hidden'>{newMessage![0].content}</p>
                <span className='whitespace-nowrap ml-auto'>{format(new Date(newMessage![0].createdAt), 'h:mm a')}</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className='aspect-square'>
            <img className="w-full h-full rounded-full" src={conversation.groupAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${conversation.groupAvatar}`} />
          </div>
          <div className='ml-4 w-full'>
            <div className='text-orange-500 dark:text-slate-50'>
              <strong>{conversation.conversationName}</strong>
            </div>
            {newMessage![0] && (
              <div className='grid grid-cols-2 text-slate-500 w-full'>
                <p className='text-ellipsis whitespace-nowrap overflow-hidden'>{newMessage![0].content}</p>
                <span className='whitespace-nowrap ml-auto'>{format(new Date(newMessage![0].createdAt), 'h:mm a')}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}