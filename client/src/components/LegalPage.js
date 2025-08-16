import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import './LegalPage.css';

const LegalPage = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <NavBar onLoginClick={() => navigate('/')} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-primary mb-6">{title}</h1>
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/')}
              className="btn-loci px-6 py-2"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
