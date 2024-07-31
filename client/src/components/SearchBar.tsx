import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { userInterface } from "../ts/interfaces/Conversation_interface";
import blankAvatar from '../assets/avatar/blank avatar.jpg'

interface SearchBarProps {
    handleClick?: (param: any) => void;
    type: 'checkbox' | 'onClick';
}

export default function SearchBar({ handleClick, type }: SearchBarProps) {

    const { user } = useAuthContext();
    const [input, setInput] = useState<string>("");
    const [searchResult, setSearchResult] = useState<userInterface[]>([]);


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
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/search?username=${input}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            setSearchResult(data); // Convert to string for display
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    return (
        <div className="w-full relative">
            <div className="flex items-center gap-2 w-full bg-gray-200 dark:bg-slate-600 rounded-md">
                <input className="peer [&::-webkit-search-cancel-button]:appearance-none w-11/12 p-1 px-2 rounded-md bg-gray-200 text-orange-500 outline-none dark:bg-slate-600 dark:text-slate-50"
                    type="search"
                    placeholder="Search"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <span>
                    <svg className="fill-orange-500 pr-2" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                        <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                    </svg>
                </span>
            </div>
            <div className="absolute w-full overflow-y-scroll bg-slate-950/30  backdrop-blur-md rounded-md border-orange-500 mt-2 px-1">
                {input !== '' ? type === "onClick" ? searchResult.map((user: userInterface) =>
                (
                    <div key={user._id} onClick={() => handleClick!(user._id)} className="w-full bg-transparent bg-opacity-30 p-2 rounded-md mt-1 text-slate-50 backdrop-blur-sm flex items-center space-x-4 hover:bg-slate-500 cursor-pointer">
                        <img className="w-12 h-12 rounded-full" src={user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${user.userAvatar}`} />
                        <p>{user.username}</p>
                    </div>
                )) : (
                    <form id="addUserFormFromSearch" onSubmit={handleClick}>
                        {searchResult.map((user: userInterface) => (
                            <div key={user._id} className="w-full p-2 rounded-md mt-1 text-slate-50 backdrop-blur-sm flex items-center space-x-4 hover:bg-slate-500">
                                <img className="w-12 h-12 rounded-full" src={user.userAvatar === undefined ? blankAvatar : `data:image/jpeg;base64,${user.userAvatar}`} />
                                <div className='flex justify-between w-full items-center'>
                                    <label htmlFor='users'>{user.username}</label>
                                    <input type="checkbox" name='users' value={user._id} className='peer appearance-none w-4 h-4 border border-spacing-1 border-orange-500 rounded-full checked:bg-orange-500 cursor-pointer' />
                                </div>
                            </div>
                        ))}
                    </form>
                ) : <></>
                }
            </div>
        </div>
    )
}