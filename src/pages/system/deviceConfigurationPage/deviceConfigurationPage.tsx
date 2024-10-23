// ./src/pages/DeviceConfigurationPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../../config/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import Popup from '../../../components/Popup/Popup';
import './deviceConfigurationPage.css';

interface PrinterConfig {
  printerConfig: 'LOCAL' | 'NETWORK';
  printerNetworkIp: string;
  printerNetworkPort: string;
}

const DeviceConfigurationPage: React.FC = () => {
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<'LOCAL' | 'NETWORK'>('NETWORK');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showIpPopup, setShowIpPopup] = useState<boolean>(false);
  const [showPortPopup, setShowPortPopup] = useState<boolean>(false);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newPort, setNewPort] = useState('');
  const [menuCollapsed] = useState(false);

  useEffect(() => {
    fetchPrinterConfig();
  }, []);

  const fetchPrinterConfig = async () => {
    try {
      const response = await apiClient.get('/system/print/configuration');
      setPrinterConfig(response.data);
      setSelectedConfig(response.data.printerConfig);
      setIpAddress(response.data.printerNetworkIp);
      setPort(response.data.printerNetworkPort);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleError = (err: any) => {
    const errorMessage = `Error: ${err.response?.status} - ${
      err.response?.data?.message || err.message
    }`;
    setError(errorMessage);
  };

  const handleConfigChange = async (config: 'LOCAL' | 'NETWORK') => {
    try {
      await apiClient.patch('/system/print/locale', {
        printerConfiguration: config,
      });
      setSelectedConfig(config);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleIpUpdate = async () => {
    try {
      await apiClient.patch('/system/print/ip', {
        printerNetworkIp: newIpAddress,
      });
      setIpAddress(newIpAddress);
      setShowIpPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handlePortUpdate = async () => {
    try {
      await apiClient.patch('/system/print/port', {
        printerNetworkPort: newPort,
      });
      setPort(newPort);
      setShowPortPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  return (
    <Layout>
      <div className={`device-configuration-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">Device Configuration</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}

        <h2 className="section-title">Printer Configuration</h2>

        <div className="configuration-section">
          <div className="config-item">
            <label>Current Printer Configuration:</label>
            <select
              value={selectedConfig}
              onChange={(e) => handleConfigChange(e.target.value as 'LOCAL' | 'NETWORK')}
            >
              <option value="LOCAL">Local</option>
              <option value="NETWORK">Network</option>
            </select>
          </div>

          <div className="config-item">
            <label>Printer Local IP Address:</label>
            <input
              type="text"
              value={ipAddress}
              readOnly
              disabled={selectedConfig === 'LOCAL'}
            />
            <button
              onClick={() => {
                setNewIpAddress(ipAddress);
                setShowIpPopup(true);
              }}
              disabled={selectedConfig === 'LOCAL'}
            >
              Update
            </button>
          </div>

          <div className="config-item">
            <label>Printer Local Port:</label>
            <input
              type="text"
              value={port}
              readOnly
              disabled={selectedConfig === 'LOCAL'}
            />
            <button
              onClick={() => {
                setNewPort(port);
                setShowPortPopup(true);
              }}
              disabled={selectedConfig === 'LOCAL'}
            >
              Update
            </button>
          </div>
        </div>

        <hr className="section-divider" />

        <h2 className="section-title">Scanner Configuration</h2>
        {/* Scanner configuration content goes here */}

        {showIpPopup && (
          <Popup title="Update IP Address" onClose={() => setShowIpPopup(false)}>
            <div className="popup-content">
              <label>New IP Address:</label>
              <input
                type="text"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
              />
              <div className="form-actions">
                <button onClick={handleIpUpdate}>Submit</button>
                <button onClick={() => setShowIpPopup(false)}>Cancel</button>
              </div>
            </div>
          </Popup>
        )}

        {showPortPopup && (
          <Popup title="Update Port" onClose={() => setShowPortPopup(false)}>
            <div className="popup-content">
              <label>New Port:</label>
              <input
                type="text"
                value={newPort}
                onChange={(e) => setNewPort(e.target.value)}
              />
              <div className="form-actions">
                <button onClick={handlePortUpdate}>Submit</button>
                <button onClick={() => setShowPortPopup(false)}>Cancel</button>
              </div>
            </div>
          </Popup>
        )}
      </div>
    </Layout>
  );
};

export default DeviceConfigurationPage;
