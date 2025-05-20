import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ onLoginClick, onSignUpClick }) => {
    const navigate = useNavigate();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <span
                            className="text-2xl font-bold text-primary cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            Memory Palace
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
                        <a href="#how-it-works" className="text-gray-600 hover:text-primary">How It Works</a>
                        <a href="#pricing" className="text-gray-600 hover:text-primary">Pricing</a>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onLoginClick}
                            className="px-4 py-2 text-primary hover:text-primary-dark font-medium"
                        >
                            Log In
                        </button>
                        <button
                            onClick={onSignUpClick}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
