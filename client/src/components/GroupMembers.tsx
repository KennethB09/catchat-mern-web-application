import { useState } from 'react';

import { useAuthContext } from '../context/AuthContext';

import { participantsInterface } from "@/ts/interfaces/Conversation_interface";

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
  group_members: participantsInterface[];
}

function GroupMembers({ group_members }: GroupMembersProps) {

  const { user } = useAuthContext();
  const ifAdmin = group_members.filter(m => m.user._id === user.userId);
  const [editMembers, setEditMembers] = useState(false);
  const [toggle, setToggle] = useState(false);

  function onClick() {
      setToggle(prev => !prev);
  };

  function toEditMembers() {
    setEditMembers(prev => !prev);
  };

  return (
    <div className="h-full">

      {ifAdmin[0].role[0] === "admin" ?
        <>
          <Sheet open={toggle}>
            <SheetTitle className='hidden'>Add members</SheetTitle>
            <SheetDescription className='hidden'>show add user component</SheetDescription>
            <SheetTrigger className={`${editMembers ? 'hidden' : 'visible'} absolute right-24 top-6`} onClick={onClick}>
              <h1>Add Members</h1>
            </SheetTrigger>
            <SheetContent side={'right'}>
              <SheetClose onClick={onClick}>
                <svg className="fill-orange-600 opacity-70 transition-opacity hover:opacity-100" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                  <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                </svg>
              </SheetClose>
              <AddMembers onClick={onClick}/>
            </SheetContent>
          </Sheet>
          {!editMembers ?
            <Button variant={'outline'} className='absolute right-4 top-4' onClick={toEditMembers}>Edit</Button>
            :
            <div className='flex gap-3 absolute right-4 top-4'>
              <Button variant={'destructive'} className=''>Remove</Button>
              <Button variant={'outline'} className='' onClick={toEditMembers}>Cancel</Button>
            </div>
          }
          <div className='pt-4'>
            {group_members.map((member) => (

              <div key={member.user._id} className="relative flex justify-between items-center p-3 h-20">
                {editMembers ?
                  <form>
                    <input type="checkbox" name='groupMember' value={user._id} className='absolute peer z-50 appearance-none w-full h-full cursor-pointer' />
                    <label htmlFor='groupMember' className='w-full gap-3 flex peer-checked:bg-slate-600 rounded-md p-2'>
                      <img className="w-12 h-12 rounded-full" src={member.user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${member.user.userAvatar}`} />
                      <div className='flex flex-col'>
                        <h1>{member.user.username}</h1>
                        <p className='text-orange-500'>{member.role}</p>
                      </div>
                    </label>
                  </form>
                  :
                  <div key={member.user._id} className="flex gap-3 items-center p-3">
                    <img className="w-12 h-12 rounded-full" src={member.user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${member.user.userAvatar}`} />
                    <div className='flex flex-col'>
                      <h1>{member.user.username}</h1>
                      <p className='text-orange-500'>{member.role}</p>
                    </div>
                  </div>
                }
              </div>

            ))}
          </div>
        </>
        :
        <>
          {group_members.map((member) => (
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
  )
}

export default GroupMembers