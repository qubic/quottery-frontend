import React from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Header from './components/layout/Header'
import StartPage from './pages/StartPage'
import BetDetailsPage from './pages/BetDetailsPage'
import BetCreatePage from './pages/BetCreatePage'
import BetPublishPage from './pages/BetPublishPage'
import './App.css'
import {QubicConnectCombinedProvider} from './contexts/QubicConnectContext'
import {QuotteryProvider} from './contexts/QuotteryContext'
import Footer from './components/layout/Footer'
import {ConfigProvider} from "./contexts/ConfigContext"
import {Toaster} from 'react-hot-toast'


function App() {
  return (
    <ConfigProvider>
      <QubicConnectCombinedProvider>
        <QuotteryProvider>
          <BrowserRouter>
            <Header/>
            <Routes>
              <Route>
                <Route path="/" element={<StartPage/>}/>
              </Route>
              <Route>
                <Route path="/bet/:id" element={<BetDetailsPage/>}/>
              </Route>
              <Route>
                <Route path="/create" element={<BetCreatePage/>}/>
              </Route>
              <Route>
                <Route path="/publish/:id" element={<BetPublishPage/>}/>
              </Route>
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#202E3C",
                  color: "#fff",
                },
              }}
            />
            <Footer/>
          </BrowserRouter>
        </QuotteryProvider>
      </QubicConnectCombinedProvider>
    </ConfigProvider>
  )
}

export default App
