import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import InputPage from './components/InputPage';
import VisualizerPage from './components/VisualizerPage';
// import UploadPage from './components/UploadPage'; // Uncomment if you have an upload page

function App() {
    const [associations, setAssociations] = useState(() => {
        const saved = localStorage.getItem('associations');
        return saved ? JSON.parse(saved) : [];
    });
    const [roomType, setRoomType] = useState(() =>
        localStorage.getItem('roomType') || ''
    );

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
    <div className="palace-bg min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/demo"
            element={<InputPage onImagesGenerated={handleImagesGenerated} />}
          />
          <Route
            path="/visualizer"
            element={<VisualizerPage associations={associations} roomType={roomType} />}
          />
          {/* <Route path="/upload" element={<UploadPage />} /> */}
        </Routes>
        {/* <div>
          <ul>
              {associations.map((assoc, index) => (
                  <li key={index}>
                      {assoc.anchor}: {assoc.memorable}
                  </li>
              ))}
          </ul>
        </div> */}
      </Router>
    </div>
  );
}

export default App;
