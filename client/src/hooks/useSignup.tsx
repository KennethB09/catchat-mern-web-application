import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";

export const useSignup = () => {
    const { dispatch } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signup = async (username: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const json = await response.json();

        if (!response.ok) {
            setError(json.error);
            setIsLoading(false);
        }
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(json));
            dispatch({ type: 'LOGIN', payload: json });
            setIsLoading(false);
            setError(null);
        }
    }
    return { signup, error, isLoading }
};