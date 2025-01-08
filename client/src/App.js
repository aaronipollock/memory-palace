import React from 'react';
import './App.css';
import InputPage from './components/InputPage';
import Gallery from './components/Gallery';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Memory Palace</h1>
      </header>
      <main>
        <InputPage />
        <Gallery />
      </main>
    </div>

  );
}

export default App;
