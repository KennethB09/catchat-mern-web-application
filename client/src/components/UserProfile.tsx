import { useState } from "react";
import { Button } from "@/components/ui/button";
import UploadImage from "../components/UploadImage";
import { useAuthContext } from '../context/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

function UserProfile() {
    const { user } = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => {
        setIsEditing(prev => !prev);
    };

    return (
        <Dialog>
            <DialogTrigger className="text-start font-semibold text-base text-gray-600 dark:text-gray-300 px-2 py-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md cursor-pointer">Profile</DialogTrigger>
            <DialogContent className="max-sm:h-screen">
                <DialogHeader className="max-sm:hidden">
                    <DialogTitle>Profile</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col items-center gap-2 max-sm:justify-between'>
                    <div className='max-sm:flex-col w-full flex gap-6'>
                        <h1 className="hidden max-sm:block text-xl text-center font-semibold text-gray-600 dark:text-slate-50">Profile</h1>
                        <div className="w-2/5 max-sm:w-full border-r-2 max-sm:border-none border-gray-300 flex justify-center items-center">
                            <UploadImage uploadPurpose='change_user_avatar' userIdOrConversationId={user.userId} imageOf="personal" imageSrc={user.userAvatar}/>
                        </div>
                        <div>
                            {isEditing ?
                                <form id='editProfileForm' className="flex flex-col w-full max-sm:border-2 rounded-xl p-2 border-gray-300">
                                    <h1 className='text-gray-600 dark:text-gray-300 text-base font-bold mb-2'>Edit Profile</h1>
                                    <label className="text-gray-600 dark:text-gray-300 text-base font-semibold mb-1" htmlFor="username">Username </label>
                                    <input type="text" name='username' placeholder="New username" className="text-gray-500 text-sm border-gray-300 dark:text-gray-200 bg-transparent border-2 rounded-xl w-full p-2 focus-within:outline-none focus-within:bg-none" />
                                </form>
                                :
                                <div className="w-full max-sm:border-2 rounded-xl p-2 border-gray-300">
                                    <h1 className="text-gray-600 dark:text-gray-300 text-base font-bold mb-2">Personal Info</h1>
                                    <h2 className="text-gray-500 dark:text-gray-400 text-base text-ellipsis whitespace-nowrap overflow-hidden">
                                        <span className="text-gray-600 dark:text-gray-300 text-base font-semibold">Username </span><br />{user.username}
                                    </h2>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-base text-ellipsis whitespace-nowrap overflow-hidden">
                                        <span className="text-gray-600 dark:text-gray-300 text-base font-semibold">E-mail </span><br />{user.email}
                                    </h3>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 w-full">
                        {!isEditing ?
                            <Button onClick={toggleEdit} className="bg-orange-500 text-slate-50 hover:opacity-75 hover:bg-orange-500">Edit</Button>
                            :
                            <>
                                <Button variant={"outline"} onClick={toggleEdit} className="border-orange-500 text-orange-500 hover:text-orange-500 hover:opacity-75">Cancel</Button>
                                <Button onClick={toggleEdit} className="bg-orange-500 text-slate-50 hover:opacity-75 hover:bg-orange-500">Save</Button>
                            </>
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UserProfile