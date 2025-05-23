import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import AuthModal from './AuthModal';
import floatingCastle from '../assets/floating-castle.png';

const API_URL = 'http://localhost:5000'; // Add API URL

const HomePage = () => {
    const navigate = useNavigate();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });

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
        setFormData({ email: '', password: '', confirmPassword: '' });
        setAuthModalOpen(true);
    };

    const handleSignUpClick = () => {
        setAuthMode('signup');
        setFormData({ email: '', password: '', confirmPassword: '' });
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
                <div className="flex flex-col items-center mb-16">
                    <img
                        src={floatingCastle}
                        alt="Floating castle memory palace"
                        className="w-64 h-64 md:w-80 md:h-80 object-contain mb-8 drop-shadow-xl"
                        style={{ background: 'transparent' }}
                    />
                    <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                        Transform your learning experience<br />with the ancient art of memory palaces.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Create vivid mental spaces to remember anything, from languages to complex concepts.
                    </p>
                </div>

                {/* Demo Button */}
                <div className="text-center mb-16">
                    <button
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 font-medium text-lg"
                    >
                        Try Demo Version
                    </button>
                </div>

                {/* Vertical Features Section */}
                <section className="space-y-24 max-w-4xl mx-auto">
                    {/* Feature 1: Learn Anything */}
                    <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12">
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
                            <img src="https://undraw.co/api/illustrations/3d2b7b2e-7e2e-4b2e-8e2e-2e6b7b2e7e2e" alt="Learn Anything" className="w-64 h-64 object-contain" />
                        </div>
                        {/* Text */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-primary mb-4">Learn Anything</h2>
                            <p className="text-lg text-gray-700">Perfect for languages, academic subjects, professional skills, and more. Palatial Minds adapts to your learning goals and helps you master any topic.</p>
                        </div>
                    </div>

                    {/* Feature 2: Visualize & Remember */}
                    <div className="flex flex-col md:flex-row-reverse items-center md:items-start md:space-x-reverse md:space-x-12">
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
                            <img src="https://undraw.co/api/illustrations/1c2b7b2e-7e2e-4b2e-8e2e-2e6b7b2e7e2e" alt="Visualize & Remember" className="w-64 h-64 object-contain" />
                        </div>
                        {/* Text */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-primary mb-4">Visualize & Remember</h2>
                            <p className="text-lg text-gray-700">Use spatial memory techniques and AI-powered images to enhance your learning and recall. See your knowledge come to life with every step.</p>
                        </div>
                    </div>

                    {/* Feature 3: Create Your Palace */}
                    <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12">
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
                            <img src="https://undraw.co/api/illustrations/2e6b7b2e-7e2e-4b2e-8e2e-2e6b7b2e7e2e" alt="Create Palace" className="w-64 h-64 object-contain" />
                        </div>
                        {/* Text */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-primary mb-4">Create Your Palace</h2>
                            <p className="text-lg text-gray-700">Design custom memory palaces with unique rooms and associations. Make learning personal and memorable by mapping your knowledge to vivid locations.</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Auth Modal */}
            <AuthModal
                key={authMode + (authModalOpen ? '-open' : '-closed') + JSON.stringify(formData)}
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                mode={authMode}
                onSubmit={handleAuthSubmit}
                error={error}
                isLoading={isLoading}
                formData={formData}
                setFormData={setFormData}
            />
        </div>
    );
};

export default HomePage;
