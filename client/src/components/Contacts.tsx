import { useEffect, useState } from 'react';
import Image from './Image';
import { useAuthContext } from '../context/AuthContext';
import { useToastContext } from '@/hooks/useToast';
import { useConversationContext } from '@/context/ConversationContext';
import { ConversationInterface, userInterface } from '@/ts/interfaces/Conversation_interface';
import { Skeleton } from "@/components/ui/skeleton";

type ContactsProps = {
  contactClick: (conversationType: string, recipientUser: userInterface, conversation: ConversationInterface) => void
}

function Contacts({ contactClick }:ContactsProps) {

  const [contacts, setContacts] = useState<userInterface[] | null>(null);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();
  const { toast } = useToastContext();
  const { conversations } = useConversationContext();

  function onClickContact(contactId: string) {
    const filtered_room = conversations?.find(room => room.participants.map(p => p.user._id).includes(contactId) && room.conversationType[0] === 'personal');
    const conversationType = filtered_room!.conversationType;
    const recipientUser = filtered_room!.participants.find(p => p.user._id === contactId);
    const conversation = filtered_room;
    contactClick(conversationType, recipientUser!.user, conversation!);
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error getting contacts',
          description: 'Failed to fetch contacts. Please try again later.',
          variant: 'destructive',
        })
      };

      setIsLoading(false);
      setContacts(data);
    };

    if (user) {
      fetchData();
    }

  }, [user]);

  return (
    <section className='px-4'>
      <div className='w-full flex justify-between pb-2'>
        <input
          className='w-3/5 bg-transparent border-b-[1px] border-orange-500 text-sm focus-within:outline-none'
          type='text'
          value={filter}
          onChange={e => setFilter(e.target.value.toLowerCase())}
          placeholder='Search by username...'
        />
        <button onClick={() => setFilter('')} className='text-sm text-gray-600 dark:text-slate-50 hover:text-orange-500'>un-filter</button>
      </div>
      <div className='flex gap-2'>
        <div className='w-full'>
          {!isLoading ?
            <>
              {contacts?.map(c => (
                <div key={c._id}>
                  {filter === '' ?
                    <div key={c._id} className='flex items-center p-2 gap-3 h-14 hover:bg-gray-300 dark:hover:bg-slate-800 cursor-pointer rounded-md' onClick={() => onClickContact(c._id)}>
                      <Image className="w-10 h-10 rounded-full" imageSource={c.userAvatar} imageOf='personal'/>
                      <h1 className='text-gray-700 dark:text-slate-50 font-semibold'>{c.username}</h1>
                    </div>
                    :
                    <>
                      {c.username.includes(filter) &&
                        <div key={c._id} className='flex items-center p-2 gap-3 h-14 hover:bg-gray-300 dark:hover:bg-slate-800 cursor-pointer rounded-md'>
                          <Image className="w-10 h-10 rounded-full" imageSource={c.userAvatar} imageOf='personal'/>
                          <h1 className='text-gray-600 dark:text-slate-50'>{c.username}</h1>
                        </div>
                      }
                    </>
                  }
                </div>
              )
              )}
            </>
            :
            <>
              {'123456789'.split('').map(i => (
                <div key={i} className='flex items-center p-2 gap-3 h-14'>
                  <Skeleton className="w-14 aspect-square bg-slate-300 dark:bg-slate-800 rounded-full" />
                  <Skeleton className="w-full h-4 bg-slate-300 dark:bg-slate-800 rounded-full" />
                </div>
              ))
              }
            </>
          }
        </div>
        <ul className='flex flex-col w-min h-full'>
          {'abcdefghijklmnopqrstuvwxyz'.split('').map(i => (
            <li key={i} className='text-[13px] text-gray-600 dark:text-slate-50 h-min leading-tight uppercase hover:text-orange-500 cursor-pointer' onClick={() => setFilter(i)}>{i}</li>
          ))
          }
        </ul>
      </div>
    </section>
  )
};

export default Contacts