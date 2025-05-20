import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import AuthModal from './AuthModal';

const API_URL = 'http://localhost:5000'; // Add API URL

const HomePage = () => {
    const navigate = useNavigate();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDemoLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'demo@example.com',
                    password: 'demo123456'
                }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/demo');
            } else {
                setError(data.message || 'Failed to login');
            }
        } catch (err) {
            setError('Failed to connect to the server. Please make sure the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthSubmit = async (formData) => {
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/demo');
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Failed to connect to the server. Please make sure the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginClick = () => {
        setAuthMode('login');
        setAuthModalOpen(true);
    };

    const handleSignUpClick = () => {
        setAuthMode('signup');
        setAuthModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background-light">
            <NavBar
                onLoginClick={handleLoginClick}
                onSignUpClick={handleSignUpClick}
            />

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                        Welcome to Memory Palace
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Transform your learning experience with the ancient art of memory palaces.
                        Create vivid mental spaces to remember anything, from languages to complex concepts.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-primary text-3xl mb-4">🏰</div>
                        <h3 className="text-xl font-semibold mb-2">Create Your Palace</h3>
                        <p className="text-gray-600">Design custom memory palaces with unique rooms and associations.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-primary text-3xl mb-4">🎯</div>
                        <h3 className="text-xl font-semibold mb-2">Visualize & Remember</h3>
                        <p className="text-gray-600">Use spatial memory techniques to enhance your learning and recall.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-primary text-3xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold mb-2">Learn Anything</h3>
                        <p className="text-gray-600">Perfect for languages, academic subjects, professional skills, and more.</p>
                    </div>
                </div>

                {/* Demo Button */}
                <div className="text-center">
                    <button
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 font-medium text-lg"
                    >
                        Try Demo Version
                    </button>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                mode={authMode}
                onSubmit={handleAuthSubmit}
                error={error}
                isLoading={isLoading}
            />
        </div>
    );
};

export default HomePage;
