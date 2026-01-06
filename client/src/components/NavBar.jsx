import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';  // We'll create this file next
import { getApiUrl } from '../config/api';

const NavBar = ({ onLoginClick }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const logoutTimeoutRef = useRef(null);

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('token');
            const loggedIn = !!token;

            // Only update state if it actually changed (prevents unnecessary re-renders)
            setIsLoggedIn(prevLoggedIn => {
                if (prevLoggedIn !== loggedIn) {
                    return loggedIn;
                }
                return prevLoggedIn; // No change, return previous value
            });
        };

        // Check immediately
        checkLoginStatus();

        // Listen for storage changes (when user logs in/out)
        const handleStorageChange = () => {
            checkLoginStatus();
        };

        // Listen for custom login event
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('login', handleStorageChange);
        window.addEventListener('logout', handleStorageChange);

        // Check periodically (in case token is set from another tab)
        // Reduced frequency to 2 seconds to minimize re-renders
        const interval = setInterval(checkLoginStatus, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('login', handleStorageChange);
            window.removeEventListener('logout', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = async () => {
        // Prevent multiple rapid clicks
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        // Clear any existing timeout
        if (logoutTimeoutRef.current) {
            clearTimeout(logoutTimeoutRef.current);
        }

        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Call the backend logout API to trigger demo palace reset
                await fetch(getApiUrl('/api/auth/logout'), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with logout even if API call fails
        } finally {
            // Always clear local storage and navigate
            localStorage.removeItem('token');
            setIsLoggedIn(false);

            // Add a small delay before navigation to ensure state is updated
            logoutTimeoutRef.current = setTimeout(() => {
                navigate('/');
                setIsLoggingOut(false);
            }, 100);
        }
    };

    return (
        <nav className="loci-nav" role="navigation" aria-label="Main Navigation">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center py-4">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <button
                            className="text-5xl font-bold text-primary cursor-pointer loci-header trajan-font loci-italic focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                            onClick={() => navigate('/')}
                            aria-label="Go to homepage"
                        >
                            Low·sAI
                        </button>
                    </div>

                    {/* Navigation Links and Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {/* Navigation Links */}
                        {isLoggedIn && (
                            <div className="flex items-center space-x-6 md:space-x-8">
                                <button
                                    onClick={() => navigate('/input')}
                                    className="relative text-base md:text-lg text-gray-700 hover:text-primary transition-colors duration-200 font-medium pb-1 group"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    Create Palace
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                                </button>
                                <button
                                    onClick={() => {
                                        // Dispatch global event to open modal (handled by App.jsx)
                                        const event = new CustomEvent('openUploadModal');
                                        window.dispatchEvent(event);
                                    }}
                                    className="relative text-base md:text-lg text-gray-700 hover:text-primary transition-colors duration-200 font-medium pb-1 group"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    Create Custom Room
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                                </button>
                                <button
                                    onClick={() => navigate('/saved-rooms')}
                                    className="relative text-base md:text-lg text-gray-700 hover:text-primary transition-colors duration-200 font-medium pb-1 group"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    My Palaces
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                                </button>
                            </div>
                        )}
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`px-4 py-2 bg-primary text-white rounded transition-colors duration-200 ${
                                    isLoggingOut
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-[#7C3AED]'
                                }`}
                            >
                                Log Out
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={onLoginClick}
                                    className="px-4 py-2 bg-primary text-white rounded transition-colors duration-200 hover:bg-[#7C3AED]"
                                >
                                    Log In
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
