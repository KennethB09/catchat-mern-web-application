import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

export const useGoogleSignUp = () => {
    const { dispatch } = useAuthContext();
    const [oAuthLoading, setOAuthLoading] = useState(false);
    const [oAuthError, setOAuthError] = useState<string | null>(null);

    const googleSignUp = async (credentialResponse: any) => {
        setOAuthLoading(true);
        setOAuthError(null);

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/catchat/api/auth/google-oauth-sign-up`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credentialResponse })
        });

        const json = await response.json();

        if (!response.ok) {
            setOAuthError(json.message);
            setOAuthLoading(false);
            return;
        }

        localStorage.setItem('user', JSON.stringify(json));
        dispatch({ type: 'LOGIN', payload: json });
        setOAuthLoading(false);
        setOAuthError(null);
    };

    const handleOAuthError = () => {
        setOAuthError('Login Failed');
        setOAuthLoading(false);
    };

    return {
        oAuthLoading,
        oAuthError,
        GoogleLogin: (
            <GoogleLogin 
                onSuccess={googleSignUp}
                onError={handleOAuthError}
            />
        )
    }
}
