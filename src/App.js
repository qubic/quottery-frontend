import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import Header from './main/header';
import FirstPage from './main/firstPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route>
          <Route path="/" element={<FirstPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
