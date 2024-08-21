import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button"

import { useConversationContext } from '../context/ConversationContext';

import { useAuthContext } from "../context/AuthContext";
import { useState } from "react";
import { userInterface } from "@/ts/interfaces/Conversation_interface";

import blankAvatar from '../assets/avatar/blank avatar.jpg';

type CreateGroupProps = {
    createGroup: () => void;
    toggleState: () => void;
}

export default function CreateGroup({ createGroup, toggleState }: CreateGroupProps) {

    const { user } = useAuthContext();
    const { dispatch } = useConversationContext();
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<userInterface[]>([]);

    const handleUsersSelection = (user: userInterface) => {
        setSelectedUsers(prev => {
            if (prev.some(selected => selected._id === user._id)) {
                return prev.filter(selected => selected._id !== user._id);
            } else {
                return [...prev, user]
            }
        });
    }

    const handleClick = async () => {

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversation-create-group`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                groupName: groupName,
                groupMember: selectedUsers
            })
        });

        const json = await response.json();
        if (response.ok) {
            if (window.innerWidth < 640) {
                createGroup();
            }
            toggleState();
            dispatch({ type: 'ADD_MESSAGE', payload: json.messages });
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: json })
        };
    };

    return (
        <div className=''>

            <Button onClick={handleClick} type="submit" variant={'default'} className="absolute right-4 top-4 p-3 h-8 bg-orange-500 text-slate-50">Create</Button>

            <div className='flex items-center gap-4 py-4'>
                <label htmlFor="createGroupInput" className="font-semibold text-orange-500 dark:text-slate-50">Group name: </label>
                <input
                    className='p-1 border-b-2 border-orange-500 bg-transparent focus-within:outline-none'
                    id="createGroupInput"
                    type='text'
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                />
            </div>

            <SearchBar type="checkbox" handleClick={handleUsersSelection} placeholder="Add user" />

            <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs font-semibold text-gray-500">Selected Users:</p>
                {selectedUsers.map(u => (
                    <div key={u._id} className="relative h-min flex items-center bg-transparent">
                        <input type="checkbox" name='selected_user' value={u._id} checked={selectedUsers.some(selected => selected._id === u._id)} onChange={() => handleUsersSelection(u)} className='absolute peer z-auto appearance-none w-full h-full cursor-pointer' />
                        <label htmlFor='selected_user' className='w-full h-full gap-3 flex items-center peer-hover:border-orange-500 border-2 peer-checked:bg-slate-300 peer-checked:dark:bg-slate-600 rounded-md p-2'>
                            <img className="w-12 h-12 rounded-full" src={u.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${u.userAvatar}`} />
                            <h1 className="text-slate-50">{u.username}</h1>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    )
}