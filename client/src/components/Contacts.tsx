import { useEffect, useState } from 'react';

import { useAuthContext } from '../context/AuthContext';

import { userInterface } from '@/ts/interfaces/Conversation_interface';

import blankAvatar from '../assets/avatar/blank avatar.jpg';

function Contacts() {

  const [contacts, setContacts] = useState<userInterface[] | null>(null)

  const { user } = useAuthContext();

  useEffect(() => {

    const fetchData = async () => {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setContacts(data);
      }
    }

    if (user) {
      fetchData();
    }

  }, [user]);

  return (
    <section className='px-4'>
      {contacts?.map(c => {
        return (
          <div key={c._id} className='flex items-center py-2 gap-3 h-14 hover:bg-gray-200 dark:hover:bg-slate-800 cursor-pointer'>
            <img className="w-10 h-10 rounded-full" src={c.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${c.userAvatar}`} alt={c.username} />
            <h1 className='text-orange-500 dark:text-slate-50'>{c.username}</h1>
          </div>
        )
      })}
    </section>
  )
};

export default Contacts