import React from 'react'
import { BrowserRouter } from "react-router-dom"
import { Route, Routes } from "react-router-dom"
import Header from './components/layout/Header'
import StartPage from './pages/StartPage'
import BetDetailsPage from './pages/BetDetailsPage'
import './App.css'
import { QubicConnectProvider } from './components/qubic/connect/QubicConnectContext'
import { QuotteryProvider } from './contexts/QuotteryContext'
import Footer from './components/layout/Footer'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <QuotteryProvider>
        <QubicConnectProvider>
          <BrowserRouter>
            <Header />
            <div className='flex-grow'>
              <Routes>
                <Route>
                  <Route path="/" element={<StartPage />} />
                </Route>
                <Route>
                  <Route path="/bet/:id" element={<BetDetailsPage />} />
                </Route>
              </Routes>
            </div>          
            <Footer />
          </BrowserRouter>
        </QubicConnectProvider>
      </QuotteryProvider>
    </div>
  )
}

export default App
