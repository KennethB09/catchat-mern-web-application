import { useState } from 'react';

import { useAuthContext } from '../context/AuthContext';
import { useToastContext } from '@/hooks/useToast';

import { participantsInterface, ConversationInterface } from "@/ts/interfaces/Conversation_interface";

import AddMembers from './AddMembers';

// UI component
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTitle,
  SheetDescription,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";

import blankAvatar from '../assets/avatar/blank avatar.jpg';

type GroupMembersProps = {
  conversation: ConversationInterface;
}

function GroupMembers({ conversation }: GroupMembersProps) {

  const { user } = useAuthContext();
  const { toast } = useToastContext();
  const [editMembers, setEditMembers] = useState(false);
  const [toggle, setToggle] = useState(false);
  const ifAdmin = conversation.participants.filter(m => m.user._id === user.userId);

  function onClick() {
    setToggle(prev => !prev);
  };

  function toEditMembers() {
    setEditMembers(prev => !prev);
  };

  const handleRemoveMember = async (e: React.FocusEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = document.getElementById('removeMemberForm') as HTMLFormElement;
    const formData = new FormData(form);
    const selectedUsers = formData.getAll('groupMember') as string[];

    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversation-remove-group-member`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        groupId: conversation._id,
        memberId: selectedUsers
      })
    });

    const json = await response.json();
    if (response.ok) {
      toast({
        title: 'Users Removed',
        description: json.message,
        variant: 'default'
      })
    };
    if (!response.ok) {
      toast({
        title: 'Ops, something went wrong',
        description: json.message,
        variant: 'destructive'
      })
    }
  };

  return (
    <div className="h-full">

      {ifAdmin[0].role[0] === "admin" ?
        <>
          <Sheet open={toggle}>
            <SheetTitle className='hidden'>Add members</SheetTitle>
            <SheetDescription className='hidden'>show add user component</SheetDescription>
            <SheetTrigger className={`${editMembers ? 'hidden' : 'visible'} absolute right-24 top-6`} onClick={onClick}>
              <span className='p-2 rounded-md bg-orange-500 text-sm text-slate-50 hover:bg-opacity-80'>Add User</span>
            </SheetTrigger>
            <SheetContent side={'right'} className='w-full'>
              <SheetClose onClick={onClick}>
                <svg className="fill-orange-600 opacity-70 transition-opacity hover:opacity-100" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                  <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                </svg>
              </SheetClose>
              <AddMembers onClick={onClick} />
            </SheetContent>
          </Sheet>
          {!editMembers ?
            <Button variant={'outline'} className='absolute right-4 top-4' onClick={toEditMembers}>Edit</Button>
            :
            <div className='flex gap-3 absolute right-4 top-4'>
              <Button variant={'destructive'} className='' form='removeMemberForm' disabled={conversation.participants.length === 1 ? true : false}>Remove</Button>
              <Button variant={'outline'} className='' onClick={toEditMembers}>Cancel</Button>
            </div>
          }
          <div className='pt-4'>
            {editMembers ?
              <>
                {conversation.participants.length > 1 &&
                  <>
                    <form id='removeMemberForm' onSubmit={handleRemoveMember} className='w-full'>
                      {conversation.participants.map((member: participantsInterface) => (

                        <div key={member.user._id} className={`${member.user._id === user.userId ? 'hidden' : 'visible'} relative flex items-center py-2 h-20`}>
                          <input type="checkbox" name='groupMember' value={member.user._id} className='absolute peer z-50 appearance-none w-full h-full cursor-pointer' />
                          <label htmlFor='groupMember' className={`w-full gap-3 flex peer-checked:bg-slate-600 rounded-md p-2`}>
                            <img className="w-12 h-12 rounded-full" src={member.user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${member.user.userAvatar}`} />
                            <div className='flex flex-col'>
                              <h1>{member.user.username}</h1>
                              <p className='text-orange-500'>{member.role}</p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </form>
                  </>
                }
              </>
              :
              <>
                {conversation.participants.map((member: participantsInterface) => (
                  <div key={member.user._id} className="flex gap-3 items-center p-3">
                    <img className="w-12 h-12 rounded-full" src={member.user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${member.user.userAvatar}`} />
                    <div className='flex flex-col'>
                      <h1>{member.user.username}</h1>
                      <p className='text-orange-500'>{member.role}</p>
                    </div>
                  </div>
                ))}
              </>
            }

          </div>
        </>
        :
        <>
          {conversation.participants.map((member) => (
            <div key={member.user._id} className="flex gap-3 items-center p-3">
              <img className="w-12 h-12 rounded-full" src={member.user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${member.user.userAvatar}`} />
              <div className='flex flex-col'>
                <h1>{member.user.username}</h1>
                <p className='text-orange-500'>{member.role}</p>
              </div>
            </div>
          ))}
        </>
      }
    </div >
  )
}

export default GroupMembers