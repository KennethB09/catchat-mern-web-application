import { createContext, useReducer, useEffect, Dispatch, useContext } from 'react';

// Define types
export interface AuthState {
    user: any | null;
}

export interface AuthAction {
    type: 'LOGIN' | 'LOGOUT';
    payload?: any;
}

export interface AuthContextType extends AuthState {
    dispatch: Dispatch<AuthAction>;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth reducer
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload };
        case 'LOGOUT':
            return { user: null };
        default:
            return state;
    }
};

// AuthContextProvider component
export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')!);
        if (user) {
            dispatch({ type: 'LOGIN', payload: user });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

// useAuthContext hook
export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthContextProvider');
    }
    return context;
};