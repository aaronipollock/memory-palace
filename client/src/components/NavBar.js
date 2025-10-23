import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';  // We'll create this file next
import { getApiUrl } from '../config/api';

const NavBar = ({ onLoginClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const logoutTimeoutRef = useRef(null);

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('token');
            const loggedIn = !!token;
            setIsLoggedIn(loggedIn);
        };

        // Check immediately
        checkLoginStatus();
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

            // Dispatch custom logout event for other components to listen
            window.dispatchEvent(new CustomEvent('logout'));

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
                    {/* <div className="hidden md:flex items-center space-x-8">
                        {isLoggedIn && location.pathname !== '/saved-rooms' && location.pathname !== '/input' && (
                            <>
                                <button
                                    onClick={() => navigate('/input')}
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

                    </div> */}


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
                                Log out
                            </button>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:scale-105 transition-transform duration-200"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
