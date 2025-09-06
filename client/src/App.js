import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import InputPage from './components/InputPage';
import VisualizerPage from './components/VisualizerPage';
import SavedRooms from './components/SavedRooms';
import LandingPage from './components/LandingPage';
import FeedbackButton from './components/FeedbackButton';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiePolicy from './components/CookiePolicy';
import { ToastProvider } from './context/ToastContext';

function App() {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <ToastProvider>
            <div className="min-h-screen">
                <Router>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LandingPage />} />
                        <Route
                            path="/demo"
                            element={
                                <InputPage
                                    isLoading={isLoading}
                                    setIsLoading={setIsLoading}
                                />
                            }
                        />
                        <Route path="/visualizer" element={<VisualizerPage />} />
                        <Route path="/saved-rooms" element={<SavedRooms />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/cookies" element={<CookiePolicy />} />
                    </Routes>
                    <FeedbackButton />
                </Router>
            </div>
        </ToastProvider>
    );
}

export default App;
