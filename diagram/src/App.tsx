import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './Componenets/home';
import Menu from './Componenets/contextMenu';

function App() {
  
  return (
    <div>
       
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
