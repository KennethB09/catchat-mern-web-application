import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button"

import { useConversationContext } from '../context/ConversationContext';

import { useAuthContext } from "../context/AuthContext";
import { useState } from "react";

interface CreateGroupProps {
    createGroup: () => void;
    toggleState: () => void
}

export default function CreateGroup({ createGroup, toggleState }: CreateGroupProps) {

    const { user } = useAuthContext();
    const { dispatch } = useConversationContext();
    const [groupName, setGroupName] = useState('');

    const handleClick = async (e: React.FocusEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = document.getElementById('addUserFormFromSearch') as HTMLFormElement;
        const formData = new FormData(form);
        const selectedUsers = formData.getAll('users') as string[];

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
            toggleState()
            createGroup();
            dispatch({ type: 'MESSAGES', payload: json.messages });
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: json })
        };
    }

    return (
        <div className=''>
            <Button form="addUserFormFromSearch" type="submit" variant={'default'} className="absolute right-4 top-4 p-3 h-8 bg-orange-500 text-slate-50">Create</Button>
            <div className='py-4'>
                <label htmlFor="createGroupInput" className="font-semibold text-orange-500 dark:text-slate-50">Group name: </label>
                <input
                    className='p-1 border-b-2 border-orange-500 rounded-tr-sm rounded-tl-sm bg-gray-200 dark:bg-slate-600'
                    id="createGroupInput"
                    type='text'
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                />
            </div>
            <SearchBar type="checkbox" handleClick={handleClick} />
        </div>
    )
}