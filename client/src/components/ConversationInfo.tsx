// Context Hook
import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from "../context/AuthContext";
import { useToastContext } from '@/hooks/useToast';
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

type ConversationInfoProps = {
    isUserBlocked: boolean | null;
    leaveConversation: () => void;
    onSheetOpen: () => void; 
    isHidden: string
}

export default function ConversationInfo({ isHidden, isUserBlocked, leaveConversation, onSheetOpen }:ConversationInfoProps) {
    const { recipientUser, conversation, dispatch } = useConversationContext();
    const { user } = useAuthContext();
    const { toast } = useToastContext();

    const leaveGroup = async () => {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversation-leave-group`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.userId,
                groupId: conversation?._id
            })
        });

        const json = await response.json();

        if (response.ok) {
            leaveConversation();
            onSheetOpen();
            dispatch({ type: 'LEAVE_GROUP', payload: json.leavedGroup })
        } else {
            toast({
                title: "Ops, something when't wrong",
                description: json.message,
                variant: 'destructive'
            })
        }
    };

    const blockUser = async () => {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/block-user`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userToBlockId: recipientUser?._id
            })
        });

        const json = await response.json();

        if (response.ok) {
            dispatch({ type: 'BLOCK_USER', payload: json.blockedUser })
            leaveConversation();
            onSheetOpen();
        } else {
            toast({
                title: "Ops, something when't wrong",
                description: json.message,
                variant: 'destructive'
            })
        }
    };

    const unblockUser = async () => {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/unblock-user`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userToUnblockId: recipientUser?._id
            })
        });

        const json = await response.json();

        if (response.ok) {
            dispatch({ type: 'UNBLOCK_USER', payload: json.unBlockUser })
        } else {
            toast({
                title: "Ops, something when't wrong",
                description: json.message,
                variant: 'destructive'
            })
        }
    };

    return (
        <aside className={`flex flex-col h-full p-4 ${isHidden} lg:w-[35%] bg-slate-100 sm:bg-slate-100 dark:bg-gray-800 sm:dark:bg-gray-800 sm:rounded-br-md sm:rounded-tr-md`}>
            {conversation?.conversationType == 'personal' ?
                <>
                    <div className="max-w-fit mx-auto mt-9 pb-2 relative">
                        <img src={recipientUser?.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${recipientUser?.userAvatar}`} className="w-28 rounded-full" />
                    </div>
                    <div className="text-orange-500 border-b-2 border-slate-300 pb-3 mb-4 dark:text-slate-50">
                        <div className="text-center text-xl font-bold pb-3">
                            <h1>{recipientUser?.username}</h1>
                        </div>
                        <p className="text-sm sm:text-xs"><span className="font-semibold">E-mail: </span><br />{recipientUser?.email}</p>
                    </div>
                </>
                :
                <>
                    <div className="max-w-fit mx-auto mt-9 pb-2 relative">
                        <img src={conversation?.groupAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${conversation?.groupAvatar}`} className="w-28 rounded-full" />
                    </div>
                    <div className="text-orange-500 border-b-2 border-slate-50 pb-3 mb-4 dark:text-slate-50">
                        <div className="text-center text-xl font-bold pb-3">
                            <h1>{conversation?.conversationName}</h1>
                        </div>
                    </div>
                </>
            }
            <div className="h-[70%] flex flex-col justify-between">
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
                            <SheetContent className='w-full sm:bg-slate-900'>
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
                        <Button variant='destructive' className="w-full font-semibold uppercase" onClick={leaveGroup}>Leave</Button>
                    </>
                    :
                    <>
                        {!isUserBlocked ?
                            <Button variant='destructive' className="w-full font-medium capitalize mt-auto" onClick={blockUser}>Block User</Button>
                            :
                            <Button variant='default' className="w-full font-medium capitalize mt-auto" onClick={unblockUser}>unBlock User</Button>
                        }
                    </>
                }
            </div>
        </aside>
    );
}