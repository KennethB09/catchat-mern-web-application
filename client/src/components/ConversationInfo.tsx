// Context Hook
import { useConversationContext } from '../context/ConversationContext';
// Assets
import blankAvatar from '../assets/avatar/blank avatar.jpg';
// Components
import GroupMembers from './GroupMembers';
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetTitle,
    SheetDescription,
    SheetHeader,
    SheetContent,
    SheetClose,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function () {
    const { recipientUser, conversation } = useConversationContext()
    return (
        <aside className="h-full">
            {conversation?.conversationType == 'personal' ?
                <>
                    <div className="max-w-fit mx-auto mt-9 pb-2 relative">
                        <img src={recipientUser?.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${recipientUser?.userAvatar}`} className="w-20 rounded-full" />
                    </div>
                    <div className="text-orange-500 border-b-2 border-slate-50 pb-3 mb-4 dark:text-slate-50">
                        <div className="text-center font-bold pb-3">
                            <h1>{recipientUser?.username}</h1>
                        </div>
                        <p><span className="font-semibold">E-mail: </span><br />{recipientUser?.email}</p>
                    </div>
                </>
                :
                <>
                    <div className="max-w-fit mx-auto mt-9 pb-2 relative">
                        <img src={conversation?.groupAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${conversation?.groupAvatar}`} className="w-20 rounded-full" />
                    </div>
                    <div className="text-orange-500 border-b-2 border-slate-50 pb-3 mb-4 dark:text-slate-50">
                        <div className="text-center font-bold pb-3">
                            <h1>{conversation?.conversationName}</h1>
                        </div>
                    </div>
                </>
            }
            <div className="h-1/2 flex flex-col justify-between">
                {conversation?.conversationType == 'group' ?
                    <>
                        <Sheet>
                            <SheetTitle className='hidden'>
                                Group Members
                            </SheetTitle>
                            <SheetDescription className='hidden'>Show the members of the group</SheetDescription>
                            <SheetTrigger>
                                <h1>Members</h1>
                            </SheetTrigger>
                            <SheetContent className='w-full'>
                                <SheetHeader>
                                    <SheetClose>
                                        <svg className="fill-orange-600 opacity-70 transition-opacity hover:opacity-100" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                                        </svg>
                                    </SheetClose>
                                </SheetHeader>
                                <GroupMembers group_members={conversation.participants} />
                            </SheetContent>
                        </Sheet>
                        <Button variant='destructive' className="w-full font-semibold uppercase">Leave</Button>
                    </>
                    :
                    <>

                        <Button variant='destructive' className="w-full font-semibold uppercase">Block User</Button>
                    </>
                }
            </div>
        </aside>
    );
}