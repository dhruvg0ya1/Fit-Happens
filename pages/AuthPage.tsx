import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, loginWithGoogle } from '../services/user';
import { Button, Input, Card } from '../components/ui';
import { DumbbellIcon, GoogleIcon } from '../components/Icons';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                // On success, the auth listener will redirect
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match.');
                    setLoading(false);
                    return;
                }
                await signup(email, password);
                // On success, the auth listener will redirect
            }
             // Navigate to dashboard, the guard will handle redirecting to onboarding if needed
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError(err.message || "Could not sign in with Google.");
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-bg p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                     <DumbbellIcon className="w-16 h-16 text-accent-1 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-light-1">Fit Happens</h1>
                    <p className="text-medium-1 mt-1">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <Input
                        label="Password"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    {!isLogin && (
                        <Input
                            label="Confirm Password"
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    )}

                    {error && <p className="text-error text-sm text-center">{error}</p>}
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </Button>
                </form>

                <div className="my-4 flex items-center">
                    <div className="flex-grow border-t border-secondary-bg"></div>
                    <span className="flex-shrink mx-4 text-medium-1 text-sm">OR</span>
                    <div className="flex-grow border-t border-secondary-bg"></div>
                </div>

                <Button
                    variant="secondary"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full !bg-white !text-gray-800 hover:!bg-gray-200 flex items-center justify-center gap-2"
                >
                    <GoogleIcon className="w-5 h-5" />
                     {loading ? 'Redirecting...' : `Sign ${isLogin ? 'in' : 'up'} with Google`}
                </Button>

                <div className="mt-6 text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-accent-2 hover:underline" disabled={loading}>
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default AuthPage;