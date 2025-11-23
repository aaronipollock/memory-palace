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
            console.log('NavBar: Checking login status', { token: token ? 'exists' : 'null', loggedIn });
            setIsLoggedIn(loggedIn);
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

        // Also check periodically (in case token is set from another tab)
        const interval = setInterval(checkLoginStatus, 1000);

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
                    <div className="flex flex-col items-start">
                        <button
                            className="text-5xl font-bold text-primary cursor-pointer loci-header trajan-font loci-italic focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1"
                            onClick={() => navigate('/')}
                            aria-label="Go to homepage"
                        >
                            Low·sAI
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-2 md:space-x-4" style={{ minWidth: '300px', backgroundColor: 'rgba(255,0,0,0.1)' }}>
                        {/* Debug: Show login status */}
                        <span style={{ fontSize: '10px', color: 'red', marginRight: '10px' }}>
                            {isLoggedIn ? 'LOGGED IN' : 'NOT LOGGED IN'}
                        </span>
                        {isLoggedIn ? (
                            <>
                                <button
                                    onClick={() => navigate('/input')}
                                    className="px-2 py-1 text-sm md:text-base text-gray-700 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-300 rounded"
                                    style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(0,255,0,0.2)' }}
                                >
                                    Create Palace
                                </button>
                                <button
                                    onClick={() => navigate('/custom-rooms/upload')}
                                    className="px-2 py-1 text-sm md:text-base text-gray-700 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-300 rounded"
                                    style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(0,255,0,0.2)' }}
                                >
                                    Create Custom Room
                                </button>
                                <button
                                    onClick={() => navigate('/saved-rooms')}
                                    className="px-2 py-1 text-sm md:text-base text-gray-700 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-300 rounded"
                                    style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(0,255,0,0.2)' }}
                                >
                                    Saved Rooms
                                </button>
                            </>
                        ) : (
                            <span style={{ color: 'red' }}>No links - not logged in</span>
                        )}
                    </div>


                    {/* Auth Buttons or Logout Link */}
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`px-4 py-2 bg-primary text-white rounded transition-colors duration-200 ${
                                    isLoggingOut
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-[#B8860B]'
                                }`}
                            >
                                Log Out
                            </button>
                        ) : (
                            <>
                                {/* <button
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
                                </button> */}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
