import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    emit: (eventName: string, ...args: any[]) => void;
    on: (eventName: string, callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null, 
    emit: () => {},
    on: () => {}
});

export function SocketProvider ({ children }: {children: React.ReactNode})  {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SERVER_URL);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const emit = (eventName: string, ...args: any[]) => {
        if (socket) {
            socket.emit(eventName, ...args);
        } else {
            console.error('Socket is not initialized');
        }
    };

    const on = (eventName: string, callback: (data: any) => void) => {
        if (socket) {
            socket.on(eventName, callback);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, emit, on }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}

