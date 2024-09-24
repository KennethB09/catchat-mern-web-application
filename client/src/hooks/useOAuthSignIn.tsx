import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

export const useGoogleSigIn = () => {
    const { dispatch } = useAuthContext();
    const [oAuthLoading, setOAuthLoading] = useState(false);
    const [oAuthError, setOAuthError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const googleSignIn = async (credentialResponse: any) => {
        setOAuthLoading(true);
        setOAuthError(null);

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/auth/google-oauth-sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credentialResponse })
        });

        const json = await response.json();

        if (!response.ok) {
            setError(json.error);
            setOAuthLoading(false);
            return;
        }

        localStorage.setItem('user', JSON.stringify(json));
        dispatch({ type: 'LOGIN', payload: json });
        setOAuthLoading(false);
        setOAuthError(null);
    };

    const handleOAuthError = () => {
        setOAuthError('Sign-in Failed');
        setOAuthLoading(false);
    };

    return {
        googleLoginError: (error),
        oAuthLoading,
        oAuthError,
        GoogleLogin: (
            <GoogleLogin 
                width={"100vw"}
                onSuccess={googleSignIn}
                onError={handleOAuthError}
            />
        )
    }
}
