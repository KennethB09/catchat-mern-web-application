import { useState } from 'react';
import { useSignup } from '../hooks/useSignup';

export default function Signup() {
    const { signup, isLoading, error } = useSignup();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await signup(username ,email, password);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button 
                type="submit" 
                disabled={isLoading}>{isLoading? 'Loading...' : 'Signup'}
            </button>
            {error && <p>{error}</p>}
        </form>
    )
}