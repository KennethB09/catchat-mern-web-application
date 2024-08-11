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
        <nav className="h-full">
            <div className="max-w-fit mx-auto mt-9 pb-2 text-center">
                <img src={user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${user.userAvatar}`} className="w-24 rounded-full" />
                <UploadImage />
            </div>
            <div className="text-orange-500 border-b-2 border-slate-50 pb-3 mb-4 dark:text-slate-50">
                <div className="text-center font-bold pb-3">
                    <h1>{user.username}</h1>
                </div>
                <p><span className="font-semibold">E-mail: </span><br />{user.email}</p>
            </div>

            <div className="h-1/2 flex flex-col justify-between">
                <ModeToggle />
                <Button onClick={logout} variant='destructive' className="w-full font-semibold uppercase">logout</Button>
            </div>
        </nav>
    )
}