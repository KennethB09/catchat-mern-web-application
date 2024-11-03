import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { userInterface } from "../ts/interfaces/Conversation_interface";
import Image from "./Image";
import { useToastContext } from '@/hooks/useToast';

type SearchBarProps = {
    handleClick?: (param: any) => void;
    type: 'checkbox' | 'onClick';
    placeholder?: string;
}

export default function SearchBar({ handleClick, type, placeholder }: SearchBarProps) {

    const { user } = useAuthContext();
    const [input, setInput] = useState<string>("");
    const [searchResult, setSearchResult] = useState<userInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToastContext();

    useEffect(() => {
        setInput('')
    }, [handleClick])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (input.trim().length > 0) {
                handleSearch();
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [input]);

    const handleSearch = async () => {

        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/search?username=${input}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setIsLoading(false);
            setSearchResult(data); // Convert to string for display
        } catch (error: any) {
            toast({
                title: "",
                description: error.message,
                variant: "destructive"
            })
        }
    };

    return (
        <div className="w-full relative z-10">

            <div className="flex items-center px-2 w-full bg-gray-200 dark:bg-slate-600 rounded-md">
                <span className="w-min">
                    <svg className="fill-orange-500 w-4" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                        <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                    </svg>
                </span>
                <input className="peer [&::-webkit-search-cancel-button]:appearance-none w-11/12 p-2 rounded-md text-xs bg-gray-200 text-orange-500 outline-none dark:bg-slate-600 dark:text-slate-50"
                    type="search"
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

            </div>

            {input !== '' &&
                <div className="absolute max-h-[30rem] w-full overflow-y-scroll p-1 bg-gray-500/30 dark:bg-slate-950/30 backdrop-blur-md rounded-md border-orange-500 mt-2 px-1 no-scrollbar">
                    {isLoading &&
                        <div className="w-full flex justify-center p-2">
                            <svg className='fill-orange-500' xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25" /><path fill="" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" dur="1.125s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" /></path>
                            </svg>
                        </div>
                    }
                    {type === "onClick" ?
                        searchResult.map((u: userInterface) => (
                            <>
                                {u._id !== user.userId &&
                                    <div key={u._id} onClick={() => handleClick!(u._id)} className="w-full bg-opacity-30 p-2 rounded-md mt-1 text-slate-50 backdrop-blur-sm flex items-center space-x-4 hover:bg-gray-500 dark:hover:bg-gray-800 cursor-pointer z-50">

                                        <Image className="w-12 h-12 rounded-full" imageSource={u.userAvatar} imageOf="personal" />

                                        <p>{u.username}</p>
                                    </div>
                                }
                            </>
                        ))
                        :
                        <>
                            {searchResult.map((u: userInterface) => (

                                <div key={u._id} className={u._id !== user.userId ? "relative flex items-center py-[1px] h-min hover:bg-gray-400 dark:hover:bg-gray-800 rounded-sm" : "hidden"}>
                                    <input type="checkbox" name='search_user' value={u._id} onChange={() => handleClick!(u)} className='absolute peer z-auto appearance-none w-full h-full cursor-pointer' />
                                    <label htmlFor='search_user' className='w-full gap-3 flex items-center peer-checked:bg-slate-300 peer-checked:dark:bg-slate-600 rounded-md p-2'>

                                        <Image className="w-12 h-12 rounded-full" imageSource={u.userAvatar} imageOf="personal" />

                                        <h1 className="text-slate-50">{u.username}</h1>
                                    </label>
                                </div>

                            ))}
                        </>
                    }
                </div>
            }

        </div>
    )
}