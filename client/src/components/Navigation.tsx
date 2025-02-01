import { useAuthContext } from '../context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import Image from './Image';
import UserProfile from './UserProfile';


export default function Navigation() {

    const { user } = useAuthContext();
    const { logout } = useLogout();

    return (
        <nav className="flex flex-col h-full">
            <div className="max-w-fit mx-auto mt-9 pb-2 text-center">
                <Image className="w-24 rounded-full" imageSource={user.userAvatar} imageOf='personal'/>
            </div>
            <div className=" border-b-[1px] border-gray-400  dark:border-gray-300 pb-3 mb-4 dark:text-slate-50">
                <div className="text-center font-bold pb-3">
                    <h1 className='text-gray-600 dark:text-slate-50 text-lg'>{user.username}</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-ellipsis whitespace-nowrap overflow-hidden"><span className="text-gray-600 dark:text-gray-300 font-semibold">E-mail: </span><br />{user.email}</p>
            </div>
            <div className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center pl-2">
                        <h1 className="font-semibold text-base text-gray-600 dark:text-gray-300">Theme </h1>
                        <ModeToggle />
                    </div>
                    <UserProfile />
                </div>
                <Button onClick={logout} variant='outline' className="w-full font-semibold text-red-600 border-red-600 hover:text-red-700 hover:border-red-700  dark:bg-gray-900 uppercase">logout</Button>
            </div>
        </nav>
    )
}