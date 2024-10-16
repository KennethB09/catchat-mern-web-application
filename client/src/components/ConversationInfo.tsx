import { useState } from 'react';
// Context Hook
import { useConversationContext } from '../context/ConversationContext';
import { useAuthContext } from "../context/AuthContext";
import { useToastContext } from '@/hooks/useToast';
// UI Components
import GroupMembers from './GroupMembers';
import UploadImage from "../components/UploadImage";
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
import Image from "./Image";

type ConversationInfoProps = {
    isUserBlocked: boolean | null;
    leaveConversation: () => void;
    onSheetOpen: () => void;
    isHidden: string
}

export default function ConversationInfo({ isHidden, isUserBlocked, leaveConversation, onSheetOpen }: ConversationInfoProps) {
    const { recipientUser, conversation, dispatch } = useConversationContext();
    const { user } = useAuthContext();
    const { toast } = useToastContext();
    const [isChangeGroupName, setIsChangeGroupName] = useState(false);
    const [groupName, setGroupName] = useState('');

    const toggleGroupName = () => {
        setIsChangeGroupName(prev => !prev);
    }

    const changeGroupName = async () => {

        if (groupName === "") {
            toast({
                title: "Note",
                description: "Group name cannot be empty",
                variant: 'default'
            })
            return
        };

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/conversation-change-group-name`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                groupId: conversation?._id,
                newGroupName: groupName
            })
        });

        const json = await response.json();

        if (response.ok) {
            toast({
                title: "",
                description: json.message,
                variant: 'default'
            });
            setGroupName('');
        } else {
            toast({
                title: "Ops, something when't wrong",
                description: json.message,
                variant: 'destructive'
            })
        }
    };

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
            if (window.innerWidth < 640) {
                leaveConversation();
                onSheetOpen();
            };
            dispatch({ type: 'LEAVE_GROUP', payload: json.leavedGroup });
            dispatch({ type: 'SET_CLICK_CONVERSATION', payload: null });
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
            dispatch({ type: 'BLOCK_USER', payload: json.blockedUser });

            if (window.innerWidth < 640) {
                leaveConversation();
                onSheetOpen();
            };
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
        <aside className={`flex flex-col h-full p-4 ${isHidden} bg-slate-100 lg:flex lg:flex-col sm:bg-slate-100 dark:bg-slate-950 sm:dark:bg-slate-950 sm:rounded-br-md sm:rounded-tr-md lg:w-[35%]`}>
            {conversation?.conversationType == 'personal' ?
                <>
                    <div className="max-w-fit mx-auto mt-9 pb-2 relative">
                        <Image className="w-24 rounded-full" imageSource={recipientUser?.userAvatar} imageOf='personal' />
                    </div>
                    <div className="border-b-[1px] border-gray-400 pb-3 mb-4 dark:text-slate-50">
                        <div className="text-center text-xl font-bold pb-3">
                            <h1 className='text-gray-600 dark:text-slate-50 text-lg'>{recipientUser?.username}</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-ellipsis whitespace-nowrap overflow-hidden"><span className="text-gray-600 dark:text-gray-300 font-semibold">E-mail: </span><br />{recipientUser?.email}</p>
                    </div>
                </>
                :
                <>
                    <div className="max-w-fit mx-auto mt-9 pb-2 text-center">
                        <UploadImage uploadPurpose='change_group_image' userIdOrConversationId={conversation?._id} imageOf='group' imageSrc={conversation?.groupAvatar} />
                    </div>
                    <div className="text-orange-500 border-b-[1px] border-gray-400 pb-3 mb-4 dark:text-slate-50">
                        <div className="text-center text-xl font-bold pb-3 min-h-7">
                            {isChangeGroupName ?
                                <div className="w-full flex flex-col">
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border-b-[1px] border-orange-500 text-sm focus-within:outline-none mb-2"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder='New group name'
                                    />
                                    <div className="ml-auto flex gap-2">
                                        <Button className='bg-orange-500 text-slate-50 hover:bg-orange-600' size={'sm'} variant={"default"} onClick={changeGroupName}>Save</Button>
                                        <Button size={'sm'} variant={"destructive"} onClick={toggleGroupName}>Cancel</Button>
                                    </div>
                                </div>
                                :
                                <h1 className='text-gray-600 dark:text-slate-50 text-lg cursor-pointer' onClick={toggleGroupName}>{conversation?.conversationName}</h1>
                            }
                        </div>
                    </div>
                </>
            }
            <div className="h-full flex flex-col justify-between">
                {conversation?.conversationType == 'group' ?
                    <>
                        <Sheet>
                            <SheetTitle className='hidden'>
                                Group Members
                            </SheetTitle>
                            <SheetDescription className='hidden'>Show the members of the group</SheetDescription>
                            <SheetTrigger>
                                <div className='flex gap-3 items-center cursor-pointer p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md'>
                                    <svg className='fill-gray-600 dark:fill-gray-300' xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
                                        <path d="M349.1 334.7c-11.2-4-29.5-4.2-37.6-7.3-5.6-2.2-14.5-4.6-17.4-8.1-2.9-3.5-2.9-28.5-2.9-28.5s7-6.6 9.9-14c2.9-7.3 4.8-27.5 4.8-27.5s6.6 2.8 9.2-10.4c2.2-11.4 6.4-17.4 5.3-25.8-1.2-8.4-5.8-6.4-5.8-6.4s5.8-8.5 5.8-37.4c0-29.8-22.5-59.1-64.6-59.1-42 0-64.7 29.4-64.7 59.1 0 28.9 5.7 37.4 5.7 37.4s-4.7-2-5.8 6.4c-1.2 8.4 3 14.4 5.3 25.8 2.6 13.3 9.2 10.4 9.2 10.4s1.9 20.1 4.8 27.5c2.9 7.4 9.9 14 9.9 14s0 25-2.9 28.5-11.8 5.9-17.4 8c-8 3.1-26.3 3.5-37.6 7.5-11.2 4-45.8 22.2-45.8 67.2h278.3c.1-45.1-34.5-63.3-45.7-67.3z" fill="" />
                                        <path d="M140 286s23.9-.8 33.4-9.3c-15.5-23.5-7.1-50.9-10.3-76.5-3.2-25.5-17.7-40.8-46.7-40.8h-.4c-28 0-43.1 15.2-46.3 40.8-3.2 25.5 5.7 56-10.2 76.5C69 285.3 93 285 93 285s1 14.4-1 16.8c-2 2.4-7.9 4.7-12 5.5-8.8 1.9-18.1 4.5-25.9 7.2-7.8 2.7-22.6 17.2-22.6 37.2h80.3c2.2-8 17.3-22.3 32-29.8 9-4.6 17.9-4.3 24.7-5.2 0 0 3.8-6-8.7-8.3 0 0-17.2-4.3-19.2-6.7-1.9-2.2-.6-15.7-.6-15.7z" fill="" />
                                        <path d="M372 286s-23.9-.8-33.4-9.3c15.5-23.5 7.1-50.9 10.3-76.5 3.2-25.5 17.7-40.8 46.7-40.8h.4c28 0 43.1 15.2 46.3 40.8 3.2 25.5-5.7 56 10.2 76.5-9.5 8.6-33.5 8.3-33.5 8.3s-1 14.4 1 16.8c2 2.4 7.9 4.7 12 5.5 8.8 1.9 18.1 4.5 25.9 7.2 7.8 2.7 22.6 17.2 22.6 37.2h-80.3c-2.2-8-17.3-22.3-32-29.8-9-4.6-17.9-4.3-24.7-5.2 0 0-3.8-6 8.7-8.3 0 0 17.2-4.3 19.2-6.7 1.9-2.2.6-15.7.6-15.7z" fill="" />
                                    </svg>
                                    <h1 className='font-semibold text-base text-gray-600 dark:text-gray-300'>Members</h1>
                                </div>
                            </SheetTrigger>
                            <SheetContent className='w-full bg-slate-100 dark:bg-slate-900'>
                                <SheetHeader>
                                    <SheetClose>
                                        <svg className="fill-orange-600 opacity-70 transition-opacity hover:opacity-100" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                                        </svg>
                                    </SheetClose>
                                </SheetHeader>
                                <GroupMembers conversation={conversation} />
                            </SheetContent>
                        </Sheet>
                        <Button variant='outline' className="w-full font-semibold text-red-600 border-red-600 hover:text-red-700 hover:border-red-700 mt-auto dark:bg-transparent uppercase" onClick={leaveGroup}>Leave</Button>
                    </>
                    :
                    <Button variant='outline' className="w-full font-semibold text-red-600 border-red-600 hover:text-red-700 hover:border-red-700 mt-auto dark:bg-transparent uppercase cursor-pointer" onClick={!isUserBlocked ? blockUser : unblockUser} disabled={conversation === null ? true : false}>{!isUserBlocked ? 'Block User' : 'unBlock User'}</Button>
                }
            </div>
        </aside>
    );
}