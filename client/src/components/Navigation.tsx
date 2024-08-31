import { useState } from 'react';
import UploadImage from "../components/UploadImage";
import { useAuthContext } from '../context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import blankAvatar from '../assets/avatar/blank avatar.jpg'
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button"


export default function Navigation() {

    const { user } = useAuthContext();
    const { logout } = useLogout();
    const [changeProfile, setChangeProfile] = useState(false);

    const toggleProfile = () => {
        setChangeProfile(prev =>!prev);
    };

    return (
        <nav className="flex flex-col h-full">
            <div className="max-w-fit mx-auto mt-9 pb-2 text-center">
                <img src={user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${user.userAvatar}`} className="w-24 rounded-full cursor-pointer" onClick={toggleProfile} />
                {changeProfile && <UploadImage uploadPurpose='change_user_avatar' userIdOrConversationId={user.userId}/>}
            </div>
            <div className=" border-b-[1px] border-gray-400  dark:border-gray-300 pb-3 mb-4 dark:text-slate-50">
                <div className="text-center font-bold pb-3">
                    <h1 className='text-gray-600 dark:text-slate-50 text-lg'>{user.username}</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-ellipsis whitespace-nowrap overflow-hidden"><span className="text-gray-600 dark:text-gray-300 font-semibold">E-mail: </span><br />{user.email}</p>
            </div>

            <div className="h-full flex flex-col justify-between">
                <div className="flex justify-between items-center cursor-pointer pl-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md">
                    <h1 className="font-semibold text-base text-gray-600 dark:text-gray-300">Theme </h1>
                    <ModeToggle />
                </div>
                <Button onClick={logout} variant='outline' className="w-full font-semibold text-red-600 border-red-600 hover:text-red-700 hover:border-red-700  dark:bg-transparent uppercase">logout</Button>
            </div>
        </nav>
    )
}