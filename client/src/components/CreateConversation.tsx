import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button"

import { useConversationContext } from '../context/ConversationContext';
import { useToastContext } from '@/hooks/useToast';
import { useAuthContext } from "../context/AuthContext";
import { Dispatch, SetStateAction, useState } from "react";
import { userInterface } from "@/ts/interfaces/Conversation_interface";
import Image from "./Image";

type CreateGroupProps = {
    createGroup: () => void;
    toggleState: () => void;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export default function CreateGroup({ createGroup, toggleState, setIsLoading }: CreateGroupProps) {

    const { user } = useAuthContext();
    const { dispatch } = useConversationContext();
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<userInterface[]>([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const { toast } = useToastContext();

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

        if (selectedUsers.length === 0) {
            return setIsEmpty(true)
        };

        if (groupName === '') {
            setGroupName(`${user.username} Group`)
        };

        setIsLoading(true)
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

            setIsEmpty(false);
            setIsLoading(false);

            if (window.innerWidth < 640) {
                createGroup();
            }

            toggleState();
            
            dispatch({ type: 'NEW_CONVERSATION', payload: json });
            dispatch({ type: 'ADD_MESSAGE', payload: json.messages });
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: json });
        } else {
            toast({
                title: "",
                description: json.error,
                variant: 'destructive'
            })
        }
    };

    return (
        <div className=''>

            <Button onClick={handleClick} type="submit" variant={'default'} className="absolute right-4 top-4 p-3 h-8 bg-orange-500 hover:opacity-50 hover:bg-orange-500 text-slate-50">Create</Button>

            <div className='flex items-center gap-4 py-4'>
                <label htmlFor="createGroupInput" className="font-semibold text-gray-600 dark:text-slate-50">Group name: </label>
                <input
                    className='p-1 border-b-2 border-gray-400 hover:border-orange-500 bg-transparent focus-within:outline-none focus-within:border-orange-500'
                    id="createGroupInput"
                    type='text'
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder={`${user.username} Group`}
                />
            </div>

            <SearchBar type="checkbox" handleClick={handleUsersSelection} placeholder="Add user" />

            <div className="flex flex-col gap-1 mt-2">
                {isEmpty && <p className='text-red-600 font-semibold text-xs'>Add some member first</p>}
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
                        <label htmlFor='selected_user' className='w-full h-full gap-3 flex items-center  peer-hover:border-orange-500 peer-hover:dark:border-orange-500 border-2 peer-checked:border-gray-400 peer-checked:dark:border-slate-600 rounded-md p-2'>
                            <Image className="w-12 h-12 rounded-full" imageSource={u.userAvatar} imageOf="personal"/>
                            <h1 className="text-gray-600 dark:text-slate-50 font-semibold">{u.username}</h1>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    )
}