import { useState } from "react";
import { Button } from "@/components/ui/button";

import SearchBar from "./SearchBar";

import { useToastContext } from '@/hooks/useToast';
import { useConversationContext } from "../context/ConversationContext";
import { userInterface } from "@/ts/interfaces/Conversation_interface";

import { useAuthContext } from '../context/AuthContext';

import blankAvatar from '../assets/avatar/blank avatar.jpg';

type addMembersProps = {
  onClick: () => void;
}

function AddMembers({ onClick }: addMembersProps) {

  const { conversation } = useConversationContext();
  const { dispatch } = useConversationContext();
  const { user } = useAuthContext();
  const { toast } = useToastContext();
  const [selectedUsers, setSelectedUsers] = useState<userInterface[]>([]);
  const [isEmpty, setIsEmpty] = useState(false);

  const handleUsersSelection = (user: userInterface) => {

    setSelectedUsers(prev => {
      if (prev.some(selected => selected._id === user._id)) {
        return prev.filter(selected => selected._id !== user._id);
      } 
      else if (conversation?.participants.map(p => p.user._id).includes(user._id)) {
        return prev
      }
      else {
        return [...prev, user]
      }
    });
  };

  const handleClick = async () => {

    if (selectedUsers.length === 0) {
      return setIsEmpty(true);
    };

    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversation-add-group-member`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        groupId: conversation?._id,
        newMembers: selectedUsers
      })
    });

    const json = await response.json();
    if (response.ok) {
      setIsEmpty(false);
      onClick()
      const newAddedMembers = json.newAddedMembers.map((i:userInterface) => ({
        user: {
          _id: i._id,
          username: i.username,
          userAvatar: i.userAvatar
        },
        role: 'member'
      }));

      toast({
        title: 'Users Added',
        description: json.message,
        variant: 'default'
      });

      dispatch({ type: 'ADD_GROUP_MEMBER', payload: newAddedMembers })
    };
    if (!response.ok) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: json.message
      })
    }
  };
  return (
    <div className='h-full pt-4'>
      <Button onClick={handleClick} type="submit" variant={'default'} className="absolute right-4 top-4 p-3 h-8 bg-orange-500 hover:bg-orange-500 hover:opacity-80 text-slate-50">Add</Button>

      <SearchBar type="checkbox" handleClick={handleUsersSelection} placeholder="Add user" />

      <div className="flex flex-col gap-1 mt-2">
        {isEmpty && <p className='text-red-600 font-semibold text-xs'>Please, select a user to add</p>}
        <p className="text-xs font-semibold text-gray-600 dark:text-slate-50">Selected Users:</p>
        {selectedUsers.map(u => (
          <div key={u._id} className="relative h-min flex items-center bg-transparent">
            <input 
            type="checkbox" 
            name='selected_user' 
            value={u._id} 
            checked={selectedUsers.some(selected => selected._id === u._id)} 
            onChange={() => handleUsersSelection(u)} 
            className='absolute peer z-auto appearance-none w-full h-full cursor-pointer' 
          />
            <label htmlFor='selected_user' className='w-full h-full gap-3 flex items-center  peer-hover:border-orange-500 border-2 peer-checked:border-gray-400 peer-hover:dark:border-orange-500 peer-checked:dark:border-slate-600 rounded-md p-2'>
              <img className="w-12 h-12 rounded-full" src={u.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${u.userAvatar}`} />
              <h1 className="text-gray-600 dark:text-slate-50 font-semibold">{u.username}</h1>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddMembers