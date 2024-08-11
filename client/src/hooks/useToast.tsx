import { useContext } from "react";
import { toastNotification } from "@/context/ToastContext";

export function useToastContext() {
    const context = useContext(toastNotification);

    if (!context) {
        throw new Error("useToastContext must be used within a ToastProvider");
    }

    return context;
}