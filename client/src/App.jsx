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
import { getApiUrl } from './config/api';

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

    // Cleanup demo custom rooms when user leaves the site
    useEffect(() => {
        const cleanupDemoCustomRooms = () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Check if user is demo user
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.email !== 'demo@example.com') return;

                // Use fetch with keepalive for reliable cleanup on page unload
                // Note: This is fire-and-forget, we don't await it
                fetch(getApiUrl('/api/custom-rooms/cleanup'), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    keepalive: true // Allows request to continue after page unloads
                }).catch(() => {
                    // Silently fail - this is cleanup, not critical
                });
            } catch (error) {
                // Silently fail - this is cleanup, not critical
                console.debug('Cleanup error (non-critical):', error);
            }
        };

        // Handle page visibility change (more reliable than beforeunload)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                cleanupDemoCustomRooms();
            }
        };

        // Handle beforeunload as backup
        const handleBeforeUnload = () => {
            cleanupDemoCustomRooms();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
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
