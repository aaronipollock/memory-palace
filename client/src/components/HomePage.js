import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import AuthModal from './AuthModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { getContextualErrorMessage } from '../utils/errorHandler';
import { useToast } from '../context/ToastContext';
import floatingCastle from '../assets/floating-castle.png';
import wizardHat from '../assets/wizard-hat.png';
import magicWand from '../assets/magic-wand.png';

const API_URL = 'http://localhost:5001'; // Add API URL

const HomePage = () => {
    const navigate = useNavigate();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const { showSuccess, showInfo } = useToast();

    const handleDemoLogin = async () => {
        setIsLoading(true);
        setError(null);
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
                showSuccess('Welcome to the demo! Let\'s create your first memory palace.');
                navigate('/demo');
            } else {
                const errorObj = new Error(data.message || 'Failed to login');
                errorObj.response = { data, status: response.status };
                setError(errorObj);
            }
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthSubmit = async (formData) => {
        setError(null);
        setIsLoading(true);

        // Basic validation
        if (!formData.email || !formData.password) {
            const validationError = new Error('Please fill in all fields');
            validationError.response = { status: 400 };
            setError(validationError);
            setIsLoading(false);
            return;
        }

        if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
            const validationError = new Error('Passwords do not match');
            validationError.response = { status: 400 };
            setError(validationError);
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
                showSuccess(authMode === 'login' ? 'Welcome back!' : 'Account created successfully!');
        navigate('/demo');
            } else {
                const errorObj = new Error(data.message || 'Authentication failed');
                errorObj.response = { data, status: response.status };
                setError(errorObj);
            }
        } catch (err) {
            setError(err);
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

    const handleRetryDemo = () => {
        setError(null);
        handleDemoLogin();
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
                    {/* <img
                        src={floatingCastle}
                        alt="Floating castle memory palace"
                        className="w-64 h-64 md:w-80 md:h-80 object-contain mb-8 drop-shadow-xl"
                        style={{ background: 'transparent' }}
                    /> */}
                    <h1 className="text-5xl font-bold mb-6 text-primary">
                        Transform your learning experience<br />with the ancient art of memory palaces.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Create vivid mental spaces to remember anything, from languages to complex concepts.
            </p>
                </div>

                {/* Demo Button */}
                <div className="text-center mb-16">
                    {error && (
                        <div className="mb-6">
                            <ErrorMessage
                                error={error}
                                context="authentication"
                                onRetry={handleRetryDemo}
                            />
                        </div>
                    )}
                <button
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 font-medium text-lg flex items-center justify-center mx-auto"
                >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" text="" className="mr-2" />
                                Loading Demo...
                            </>
                        ) : (
                            'Try Demo Version'
                        )}
                </button>
                </div>

                {/* Vertical Features Section */}
                <section className="space-y-24 max-w-4xl mx-auto">
                    {/* Feature 1: Create Your Palace */}
                    <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12">
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
                            <img src={floatingCastle} alt="Create Palace" className="w-64 h-64 object-contain" />
                        </div>
                        {/* Text */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-primary mb-4">Create Your Palace</h2>
                            <p className="text-lg text-gray-700">Design custom memory palaces with unique rooms and associations. Make learning personal and memorable by mapping your knowledge to vivid locations.</p>
                        </div>
                    </div>

                    {/* Feature 2: Visualize & Remember */}
                    <div className="flex flex-col md:flex-row-reverse items-center md:items-start md:space-x-reverse md:space-x-12">
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
                            <img src={magicWand} alt="Visualize & Remember" className="w-64 h-64 object-contain" />
                        </div>
                        {/* Text */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-primary mb-4">Visualize & Remember</h2>
                            <p className="text-lg text-gray-700">Use spatial memory techniques and AI-powered images to enhance your learning and recall. See your knowledge come to life with every step.</p>
                        </div>
                    </div>

                    {/* Feature 3: Learn Anything */}
                    <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12">
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
                            <img src={wizardHat} alt="Wizard Hat" className="w-64 h-64 object-contain" />
                        </div>
                        {/* Text */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-primary mb-4">Learn Anything</h2>
                            <p className="text-lg text-gray-700">Perfect for languages, academic subjects, professional skills, and more. Palatial Minds adapts to your learning goals and helps you master any topic.</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Auth Modal */}
            <AuthModal
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
