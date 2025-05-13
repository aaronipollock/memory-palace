import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any stored data
        localStorage.removeItem('token');
        localStorage.removeItem('associations');
        localStorage.removeItem('roomType');
        localStorage.removeItem('acceptedImages');

        // Navigate to home page
        navigate('/');
    };

    return (
        <nav className="bg-primary shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-white text-xl font-bold">Memory Palace</Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/saved-rooms"
                            className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            Saved Rooms
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
