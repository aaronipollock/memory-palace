import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import InputPage from './components/InputPage';
import VisualizerPage from './components/VisualizerPage';
import SavedRooms from './components/SavedRooms';
import LandingPage from './components/LandingPage';
import FeedbackButton from './components/FeedbackButton';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiePolicy from './components/CookiePolicy';
import UserGuide from './components/UserGuide';
import About from './components/About';
import UploadRoomPhotoPage from './components/UploadRoomPhotoPage';
import AnchorPointEditor from './components/AnchorPointEditor';
import UploadRoomPhoto from './components/UploadRoomPhoto';
import { ToastProvider } from './context/ToastContext';

function AppContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        // Listen for global event to open upload modal
        const handleOpenModal = () => {
            setShowUploadModal(true);
        };
        window.addEventListener('openUploadModal', handleOpenModal);
        return () => {
            window.removeEventListener('openUploadModal', handleOpenModal);
        };
    }, []);

    const handleUploadSuccess = () => {
        // Dispatch event to refresh custom rooms (UserDashboard listens for this)
        const event = new CustomEvent('refreshCustomRooms');
        window.dispatchEvent(event);
        // Modal will handle navigation to edit page
        setShowUploadModal(false);
    };

    const handleUploadClose = () => {
        setShowUploadModal(false);
    };

    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LandingPage />} />
                <Route
                    path="/input"
                    element={
                        <InputPage
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                        />
                    }
                />
                <Route path="/visualizer" element={<VisualizerPage />} />
                <Route path="/saved-rooms" element={<SavedRooms />} />
                <Route path="/custom-rooms/upload" element={<UploadRoomPhotoPage />} />
                <Route path="/custom-rooms/:id/edit" element={<AnchorPointEditor />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/user-guide" element={<UserGuide />} />
                <Route path="/about" element={<About />} />
            </Routes>
            <FeedbackButton />
            {/* Global Upload Room Photo Modal - appears over any page */}
            <UploadRoomPhoto
                isOpen={showUploadModal}
                onClose={handleUploadClose}
                onSuccess={handleUploadSuccess}
            />
        </>
    );
}

function App() {
    return (
        <ToastProvider>
            <div className="min-h-screen">
                <Router>
                    <AppContent />
                </Router>
            </div>
        </ToastProvider>
    );
}

export default App;
