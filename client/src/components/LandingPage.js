import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div>
            <h1>Welcome to the Memory Palace App</h1>
            <p>Organize your memories in a virtual space.</p>
            <Link to="/input">
                <butoon>Get Started</butoon>
            </Link>
        </div>
    );
};

export default LandingPage;
