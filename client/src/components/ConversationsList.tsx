// Context
import { useAuthContext } from '../context/AuthContext';

import { format } from 'date-fns';
// Assets
import blankAvatar from '../assets/avatar/blank avatar.jpg'
// Interfaces
import { ConversationInterface, participantsInterface, userInterface } from '../ts/interfaces/Conversation_interface';

interface ConversationListProps {
  conversation: ConversationInterface;
  onClickConversation: (conversationType: string, recipientUser: userInterface, conversation: ConversationInterface) => void;
}

export default function ConversationList({ conversation, onClickConversation }: ConversationListProps) {

  const { user } = useAuthContext();
  const conversationType = conversation.conversationType;

  const recipientUser: participantsInterface[] = conversation.participants.filter(participant => participant.user._id !== user.userId);

  const newMessage = conversation.messages?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const avatar = conversation.participants.filter(u => u.user._id.toString() !== user.userId.toString());

  function conversationClick() {
    onClickConversation(conversationType, recipientUser[0]?.user, conversation);
  };

  return (
    <div onClick={conversationClick} className='flex items-center p-2 h-min hover:bg-gray-300 dark:hover:bg-slate-800 cursor-pointer rounded-md'>
      {conversation.conversationType == 'personal' ? (
        <>
          <div className=''>
            <img className="w-16 rounded-full" alt='user avatar' src={avatar[0].user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${avatar[0].user.userAvatar}`} />
          </div>
          <div className='ml-4 w-full'>
            <div className='text-gray-700 dark:text-slate-50'>
              <strong>{recipientUser[0].user.username}</strong>
            </div>
            {newMessage![0] && (
              <div className='grid grid-cols-2 w-full text-slate-500'>
                <div className='w-full'>
                  <p className='text-ellipsis whitespace-nowrap overflow-hidden'>{newMessage![0].sender._id === user.userId ? 'You: ' + newMessage![0].content : newMessage![0].content}</p>
                </div>
                <span className='whitespace-nowrap ml-auto'>{format(new Date(newMessage![0].createdAt), 'h:mm a')}</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className=''>
            <img className="w-16 rounded-full" alt='group avatar' src={conversation.groupAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${conversation.groupAvatar}`} />
          </div>
          <div className='ml-4 w-full'>
            <div className='text-gray-700 dark:text-slate-50'>
              <strong>{conversation.conversationName}</strong>
            </div>
            {newMessage![0] && (
              <div className='grid grid-cols-2 w-full text-slate-500'>
                <div className='w-full'>
                  <p className='text-ellipsis whitespace-nowrap overflow-hidden'>{newMessage![0].sender._id === user.userId ? 'You: ' + newMessage![0].content : newMessage![0].content}</p>
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