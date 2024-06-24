import React from 'react'
import { BrowserRouter } from "react-router-dom"
import { Route } from "react-router-dom"
import { Routes } from "react-router-dom"
import Header from './components/layout/Header'
import StartPage from './pages/StartPage'
import BetDetailsPage from './pages/BetDetailsPage'
import './App.css'
import { QubicConnectProvider } from './components/qubic/connect/QubicConnectContext'
import { BetProvider } from './contexts/BetContext'

function App() {
  return (
    <BetProvider>
      <QubicConnectProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route>
              <Route path="/" element={<StartPage />} />
            </Route>
            <Route>
              <Route path="/bet/:id" element={<BetDetailsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QubicConnectProvider>
    </BetProvider>
  )
}

export default App
