import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import InputPage from './components/InputPage';
import VisualizerPage from './components/VisualizerPage';
import SavedRooms from './components/SavedRooms';
import LandingPage from './components/LandingPage';
import FeedbackButton from './components/FeedbackButton';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiePolicy from './components/CookiePolicy';
import { ToastProvider } from './context/ToastContext';
// import UploadPage from './components/UploadPage'; // Uncomment if you have an upload page

function App() {
    const [associations, setAssociations] = useState(() => {
        const saved = localStorage.getItem('associations');
        return saved ? JSON.parse(saved) : [];
    });
    const [roomType, setRoomType] = useState(() =>
        localStorage.getItem('roomType') || ''
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('associations', JSON.stringify(associations));
        localStorage.setItem('roomType', roomType);
    }, [associations, roomType]);

    const handleImagesGenerated = (newAssociations, newRoomType) => {
        console.log('Generated associations:', newAssociations);
        console.log('Room type:', newRoomType);

        if (Array.isArray(newAssociations)) {
            setAssociations(newAssociations);
            setRoomType(newRoomType);
            // Use navigate instead of window.location
            window.location.href = '/visualizer';
        } else {
            console.error('Invalid associations data:', newAssociations);
        }
    };

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
                onImagesGenerated={handleImagesGenerated}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            }
          />
          <Route
            path="/visualizer"
            element={<VisualizerPage associations={associations} roomType={roomType} />}
          />
          <Route path="/saved-rooms" element={<SavedRooms />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          {/* <Route path="/upload" element={<UploadPage />} /> */}
        </Routes>
        <FeedbackButton />
      </Router>
    </div>
    </ToastProvider>
  );
}

export default App;
