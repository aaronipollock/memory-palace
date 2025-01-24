import React, { useState } from 'react';
import './App.css';
import InputPage from './components/InputPage';
import MemoryPalace from './components/MemoryPalace';

function App() {
  const [associations, setAssociations] = useState([]);
  const [currentView, setCurrentView] = useState('input');
  const [isLoading, setIsLoading] = useState(false);

  const handleImagesGenerated = (generatedImages) => {
    setAssociations(generatedImages);
    setCurrentView('palace');
    setIsLoading(false);
  };

  return (
    <div className="App">
      <main>
        {currentView === 'input' ? (
          <InputPage
            onImagesGenerated={handleImagesGenerated}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
        ) : (
          <MemoryPalace associations={associations} />
        )}
        <nav className="app-navigation">
          <button
            className={`nav-button ${currentView === 'input' ? 'active' : ''}`}
            onClick={() => setCurrentView('input')}
            disabled={isLoading}
          >
            Create Associations
          </button>
          <button
            className={`nav-button ${currentView === 'palace' ? 'active' : ''}`}
            onClick={() => setCurrentView('palace')}
            disabled={associations.length === 0 || isLoading}
          >
            View Memory Palace
          </button>
        </nav>
      </main>
    </div>
  );
}

export default App;
