// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import StartPage from "./pages/StartPage";
import BetDetailsPage from "./pages/BetDetailsPage";
import BetCreatePage from "./pages/BetCreatePage";
import BetPublishPage from "./pages/BetPublishPage";
import Footer from "./components/layout/Footer";
import { ThemeContextProvider } from "./contexts/ThemeContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { QubicConnectProvider } from "./components/qubic/connect/QubicConnectContext";
import { QuotteryProvider } from "./contexts/QuotteryContext";
import UserBets from "./components/UserBets";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import "./App.css";
import { Box } from "@mui/material";

function App() {
  return (
    <ThemeContextProvider>
      <ConfigProvider>
        <QubicConnectProvider>
          <QuotteryProvider>
            <SnackbarProvider>
              <BrowserRouter>
                <Header />
                <Box component="main">
                  <Routes>
                    /
                    <Route path="/" element={<StartPage />} />
                    <Route path="/bet/:id" element={<BetDetailsPage />} />
                    <Route path="/create" element={<BetCreatePage />} />
                    <Route path="/publish/:id" element={<BetPublishPage />} />
                    <Route path="/user-bets" element={<UserBets />} />
                  </Routes>
                </Box>
                <Footer />
              </BrowserRouter>
            </SnackbarProvider>
          </QuotteryProvider>
        </QubicConnectProvider>
      </ConfigProvider>
    </ThemeContextProvider>
  );
}

export default App;
