// ./src/pages/PrinterConfigurationPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../../config/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import './deviceConfigurationPage.css';

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

interface Printer {
  name: string;
  uid: string;
  connection: string;
  sendThenRead: (
    data: string,
    successCallback: (response: any) => void,
    errorCallback: (error: any) => void
  ) => void;
}

const DeviceConfigurationPage: React.FC = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinterUid, setSelectedPrinterUid] = useState<string>('');
  const [defaultPrinterUid, setDefaultPrinterUid] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailablePrinters();
    fetchDefaultPrinter();
  }, []);

  // Fetch available printers using the Browser Print SDK
  const fetchAvailablePrinters = () => {
    if (!window.BrowserPrint) {
      setError('Browser Print SDK not found. Please ensure it is loaded.');
      return;
    }

    window.BrowserPrint.getLocalDevices(
      (devices: any[]) => {
        const printerDevices = devices.filter((device) => device.connection === 'usb' || device.connection === 'network');
        setPrinters(printerDevices);
      },
      (error: any) => {
        setError('Error fetching printers: ' + error);
      },
      'printer'
    );
  };

  // Fetch the default printer UID from the API
  const fetchDefaultPrinter = async () => {
    try {
      const response = await apiClient.get('/system/print/default-printer');
      setDefaultPrinterUid(response.data.defaultPrinterUid);
      setSelectedPrinterUid(response.data.defaultPrinterUid);
    } catch (err: any) {
      handleError(err);
    }
  };

  // Handle errors
  const handleError = (err: any) => {
    const errorMessage = `Error: ${err.response?.status} - ${
      err.response?.data?.message || err.message
    }`;
    setError(errorMessage);
  };

  // Handle printer selection change
  const handlePrinterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrinterUid(event.target.value);
  };

  // Save the selected printer as the default printer
  const saveDefaultPrinter = async () => {
    try {
      await apiClient.patch('/system/print/default-printer', {
        defaultPrinterUid: selectedPrinterUid,
      });
      alert('Default printer saved successfully');
      setDefaultPrinterUid(selectedPrinterUid);
    } catch (err: any) {
      handleError(err);
    }
  };

  // Test connectivity to the selected printer
  const testPrinterConnectivity = () => {
    const printer = printers.find((p) => p.uid === selectedPrinterUid || p.connection === selectedPrinterUid);
    if (!printer) {
      alert('Selected printer not found');
      return;
    }

    printer.sendThenRead(
      '~HQES', // Command to get printer status,
      (response: any) => {
        alert('Printer is reachable:\n' + response);
      },
      (error: any) => {
        alert('Failed to communicate with printer:\n' + error);
      }
    );
  };

  return (
    <Layout>
      <div className="printer-config-page">
        <h1 className="page-title">Printer Configuration</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}

        <div className="config-container">
          <label>Select a Printer:</label>
          <select value={selectedPrinterUid} onChange={handlePrinterChange}>
            <option value="">-- Select Printer --</option>
            {printers.map((printer) => (
              <option key={printer.uid} value={printer.uid || printer.connection}>
                {printer.name}
              </option>
            ))}
          </select>

          <button onClick={testPrinterConnectivity}>Test Connectivity</button>
          <button onClick={saveDefaultPrinter}>Save as Default</button>
        </div>

        {defaultPrinterUid && (
          <div className="default-printer-info">
            <p>Current Default Printer UID: {defaultPrinterUid}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DeviceConfigurationPage;
