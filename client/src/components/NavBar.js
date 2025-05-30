import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';  // We'll create this file next

const NavBar = ({ onLoginClick, onSignUpClick }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <nav className="loci-nav">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <span
                            className="text-5xl font-bold text-primary cursor-pointer loci-header trajan-font loci-italic"
                            onClick={() => navigate('/')}
                        >
                            Loci
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {isLoggedIn && (
                            <>
                                <button
                                    onClick={() => navigate('/demo')}
                                    className="loci-nav-link"
                                >
                                    Create Palace
                                </button>
                                <button
                                    onClick={() => navigate('/saved-rooms')}
                                    className="loci-nav-link"
                                >
                                    Saved Rooms
                                </button>
                            </>
                        )}
                    </div>

                    {/* Auth Buttons or Logout Link */}
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-white text-black border border-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors duration-200"
                            >
                                Log Out
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={onLoginClick}
                                    className="loci-nav-link !text-white"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={onSignUpClick}
                                    className="btn-loci"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
