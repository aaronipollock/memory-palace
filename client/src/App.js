import React, { useState } from 'react';
import './App.css';
import InputPage from './components/InputPage';
import Gallery from './components/Gallery';

function App() {
  const [generatedImages, setGeneratedImages] = useState([]);

  const handleImagesGenerated = (images) => {
    setGeneratedImages(images);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Memory Palace</h1>
      </header>
      <main>
        <InputPage onImagesGenerated={handleImagesGenerated} />
        <Gallery images={generatedImages} />
      </main>
    </div>
  );
}

export default App;
