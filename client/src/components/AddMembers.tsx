import { Button } from "@/components/ui/button";

import SearchBar from "./SearchBar";

import { useToastContext } from '@/hooks/useToast';

import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from '../context/AuthContext';

type addMembersProps = {
  onClick: () => void;
}

function AddMembers({ onClick }: addMembersProps) {

  const { conversation } = useConversationContext();
  const { user } = useAuthContext();
  const { toast } = useToastContext();
  const customFormId = 'addMember';

  const handleClick = async (e: React.FocusEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = document.getElementById(customFormId) as HTMLFormElement;
    const formData = new FormData(form);
    const selectedUsers = formData.getAll('users') as string[];

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
      onClick()
      toast({
        title: 'Users Added',
        description: json.message,
        variant: 'default'
      })
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
      <Button form={customFormId} type="submit" variant={'default'} className="absolute right-4 top-4 p-3 h-8 bg-orange-500 text-slate-50">Add</Button>
      <SearchBar type="checkbox" searchBarFormId={customFormId} handleClick={handleClick} placeholder="Add user" />
    </div>
  )
}

export default AddMembers