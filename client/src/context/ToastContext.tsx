import { createContext } from "react";

import { useToast } from "@/components/ui/use-toast";


type TypeToast = {
    title: string;
    description: string;
    variant: 'default' | 'destructive';
}

type ToastProvider = {
    children: React.ReactNode;
}

export type ToastNotificationProvider = {
    toast: ({title, description, variant}: TypeToast) => void;
};

export const toastNotification = createContext<ToastNotificationProvider | undefined>(undefined);

// Reminder: Always use Uppercase name on custom hooks 
export function ToastProvider({ children }: ToastProvider) {
    const { toast } = useToast();
    function sendToast({ title, description, variant }: TypeToast) {
        toast({
            variant: variant,
            title: title,
            description: description
        })
    };

    return (
        <toastNotification.Provider value={{ toast: sendToast }}>
            {children}
        </toastNotification.Provider>
    )
};