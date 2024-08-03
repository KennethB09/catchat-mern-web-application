import { useAuthContext } from '../context/AuthContext';

import { participantsInterface } from "@/ts/interfaces/Conversation_interface";

import { Button } from "@/components/ui/button";

import blankAvatar from '../assets/avatar/blank avatar.jpg';

type GroupMembersProps = {
    group_members: participantsInterface[];
}

function GroupMembers({ group_members }: GroupMembersProps) {
  const { user } = useAuthContext();
  const ifAdmin = group_members.filter(m => m.user._id === user.userId);
  return (
    <div className="h-full">

        {ifAdmin[0].role[0] === "admin" ?
        <>
          <Button variant={'outline'} className='absolute right-4 top-4'>Edit</Button>
          {group_members.map((member) => (
            <div key={member.user._id} className="flex gap-3 items-center p-3">
              <img className="w-12 h-12 rounded-full" src={member.user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${member.user.userAvatar}`}/>
              <div className='flex flex-col'>
                <h1>{member.user.username}</h1>
                <p className='text-orange-500'>{member.role}</p>
              </div>
            </div>
          ))}
        </>
        :
        <>
          {group_members.map((member) => (
            <div key={member.user._id} className="flex gap-3 items-center p-3">
              <img className="w-12 h-12 rounded-full" src={member.user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${member.user.userAvatar}`}/>
              <div className='flex flex-col'>
                <h1>{member.user.username}</h1>
                <p className='text-orange-500'>{member.role}</p>
              </div>
            </div>
          ))}
        </>
        }
      {/* Add a button to invite more users */}
    </div>
  )
}

export default GroupMembers