import React, { createContext, useContext, useState, useEffect } from "react";

// Default endpoints
const DEFAULT_HTTP_ENDPOINT = "https://rpc.qubic.org";
const DEFAULT_BACKEND_URL = "https://api.quottery.org";

// Testnet endpoints
// const DEFAULT_HTTP_ENDPOINT = 'https://91.210.226.146'
// const DEFAULT_BACKEND_URL = 'https://qbtn.qubic.org'

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [httpEndpoint, setHttpEndpoint] = useState(DEFAULT_HTTP_ENDPOINT);
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [connectedToCustomServer, setConnectedToCustomServer] = useState(false);

  useEffect(() => {
    const savedHttpEndpoint = localStorage.getItem("httpEndpoint");
    const savedBackendUrl = localStorage.getItem("backendUrl");

    if (savedHttpEndpoint && savedBackendUrl) {
      setHttpEndpoint(savedHttpEndpoint);
      setBackendUrl(savedBackendUrl);
      setConnectedToCustomServer(true);
    }
  }, []);

  const resetEndpoints = () => {
    setHttpEndpoint(DEFAULT_HTTP_ENDPOINT);
    setBackendUrl(DEFAULT_BACKEND_URL);
    setConnectedToCustomServer(false);
    localStorage.removeItem("httpEndpoint");
    localStorage.removeItem("backendUrl");
  };

  const updateEndpoints = (newHttpEndpoint, newBackendUrl) => {
    setHttpEndpoint(newHttpEndpoint);
    setBackendUrl(newBackendUrl);
    setConnectedToCustomServer(true);

    localStorage.setItem("httpEndpoint", newHttpEndpoint);
    localStorage.setItem("backendUrl", newBackendUrl);
  };

  return (
    <ConfigContext.Provider
      value={{
        httpEndpoint,
        backendUrl,
        connectedToCustomServer,
        resetEndpoints,
        updateEndpoints,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
