import { useState } from "react";
import Card from "@mui/material/Card";
import CloseIcon from "../../../assets/close.svg";
import { useConfig } from "../../../contexts/ConfigContext";

const ServerConfigModal = ({ isOpen, onClose }) => {
  const { updateEndpoints } = useConfig();
  const [selectedMode, setSelectedMode] = useState("form");
  const [httpEndpointInput, setHttpEndpointInput] = useState("");
  const [backendUrlInput, setBackendUrlInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = () => {
    if (!httpEndpointInput || !backendUrlInput) {
      setErrorMsg("Please enter both HTTP Endpoint and Backend URL.");
      return;
    }
    // TODO: Add URL validation here

    updateEndpoints(httpEndpointInput, backendUrlInput);
    handleClose();
    window.location.reload();
  };

  const handleClose = () => {
    // Reset the inputs and errors when closing
    setHttpEndpointInput("");
    setBackendUrlInput("");
    setErrorMsg("");
    setSelectedMode("form");
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="w-full p-5 h-full fixed top-0 left-0 overflow-x-hidden overflow-y-auto z-50 bg-smoke-light flex"
          onClick={handleClose}
        >
          <Card
            className="relative p-8 w-full max-w-md m-auto flex-col flex"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-white text-xl font-bold">
                Connect to Server
              </h2>
              <img
                src={CloseIcon}
                onClick={handleClose}
                alt="Close Modal Icon"
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            {selectedMode === "form" && (
              <div className="text-white mt-4">
                <label className="block mb-2">HTTP Endpoint:</label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-50 rounded-lg text-black"
                  placeholder="Enter HTTP Endpoint"
                  value={httpEndpointInput}
                  onChange={(e) => setHttpEndpointInput(e.target.value)}
                />

                <label className="block mt-4 mb-2">Backend URL:</label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-50 rounded-lg text-black"
                  placeholder="Enter Backend URL"
                  value={backendUrlInput}
                  onChange={(e) => setBackendUrlInput(e.target.value)}
                />

                {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    className="bg-primary-40 p-4 rounded-lg text-black"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-primary-40 p-4 rounded-lg text-black"
                    onClick={handleSave}
                  >
                    Connect
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default ServerConfigModal;
