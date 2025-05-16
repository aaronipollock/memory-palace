import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000'; // Add API URL

const HomePage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
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

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background-light">
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

                {/* Auth Section */}
                <div className="max-w-md mx-auto">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                            {isLogin ? 'Welcome Back' : 'Start Your Journey'}
                        </h2>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 font-medium"
                            >
                                {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-4">
                            <button
                                onClick={toggleAuthMode}
                                className="text-primary hover:text-primary-dark font-medium"
                            >
                                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or try the demo</span>
                                </div>
                            </div>

                            <button
                                onClick={handleDemoLogin}
                                disabled={isLoading}
                                className="w-full px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 disabled:opacity-50 font-medium"
                            >
                                Try Demo Version
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
