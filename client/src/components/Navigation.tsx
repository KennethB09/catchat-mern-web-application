import UploadImage from "../components/UploadImage";
import { useAuthContext } from '../context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import blankAvatar from '../assets/avatar/blank avatar.jpg'
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button"


export default function Navigation() {

    const { user } = useAuthContext();
    const { logout } = useLogout();

    return (
        <nav className="flex flex-col h-full">
            <div className="max-w-fit mx-auto mt-9 pb-2 text-center">
                <img src={user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${user.userAvatar}`} className="w-24 rounded-full" />
                <UploadImage />
            </div>
            <div className="text-orange-500 border-b-2 border-orange-500  dark:border-slate-50 pb-3 mb-4 dark:text-slate-50">
                <div className="text-center font-bold pb-3">
                    <h1>{user.username}</h1>
                </div>
                <p className="text-sm"><span className="font-semibold">E-mail: </span><br />{user.email}</p>
            </div>

            <div className="h-full flex flex-col justify-between">
                <div className="flex justify-between items-center cursor-pointer hover:border-b-[1px] hover:border-gray-400">
                    <h1 className="font-bold text-base text-slate-500">Theme </h1>
                    <ModeToggle />
                </div>
                <Button onClick={logout} variant='destructive' className="w-full font-semibold uppercase">logout</Button>
            </div>
        </nav>
    )
}