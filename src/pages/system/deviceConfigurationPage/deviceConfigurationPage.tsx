import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../../config/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import MessagePopup from '../../../components/MessagePopup/MessagePopup';
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
  const [message, setMessage] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const scannerInputRef = useRef('');

  const fetchDefaultPrinter = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/print/default-printer');
      setDefaultPrinterUid(response.data.defaultPrinterUid);
      setSelectedPrinterUid(response.data.defaultPrinterUid);
    } catch (err: any) {
      setError('Printer Configuration: The default printer could not be found or is not set.');
    }
  }, []);

  const fetchAvailablePrinters = useCallback(() => {
    if (!window.BrowserPrint) {
      setError('Printer Configuration: Zebra Browser Print SDK not found.');
      return;
    }

    window.BrowserPrint.getLocalDevices(
      (devices: any[]) => {
        const printerDevices = devices.filter(
          (device) => device.connection === 'usb' || device.connection === 'network'
        );
        setPrinters(printerDevices);
        setMessage('Printer list refreshed');
      },
      (error: any) => {
        setError('Printer Configuration: Error Retrieving Printer List');
      },
      'printer'
    );
  }, []);

  useEffect(() => {
    fetchAvailablePrinters();
    fetchDefaultPrinter();
  }, [fetchDefaultPrinter, fetchAvailablePrinters]);

  const handlePrinterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrinterUid(event.target.value);
  };

  const saveDefaultPrinter = async () => {
    try {
      await apiClient.patch('/system/print/default-printer', {
        defaultPrinterUid: selectedPrinterUid,
      });
      setMessage('Printer Configuration: Default Printer saved');
      setDefaultPrinterUid(selectedPrinterUid);
    } catch (err: any) {
      setError('Printer Configuration: The Default Printer could not be saved');
    }
  };

  const testPrinterConnectivity = () => {
    const printer = printers.find(
      (p) => p.uid === selectedPrinterUid || p.connection === selectedPrinterUid
    );
    if (!printer) {
      setMessage('Printer Configuration: Selected Printer not found');
      return;
    }

    printer.sendThenRead(
      '~HQES', // ZPL Printer Status command
      (response: any) => {
        setMessage('Printer Configuration: Printer connection succeeded');
      },
      (error: any) => {
        setError('Failed to communicate with printer:\n' + error);
      }
    );
  };

  // Handle scanner input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const ignoredKeys = [
      'Shift',
      'Control',
      'Alt',
      'Meta',
      'CapsLock',
      'Tab',
      'Escape',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Insert',
      'Delete',
      'Home',
      'End',
      'PageUp',
      'PageDown',
      'NumLock',
      'ScrollLock',
      'Pause',
      'ContextMenu',
    ];

    if (event.key === 'Enter') {
      const url = scannerInputRef.current;
      scannerInputRef.current = '';
      setIsListening(false);
      window.open(url, '_blank');
    } else if (!ignoredKeys.includes(event.key) && event.key.length === 1) {
      scannerInputRef.current += event.key;
    }
    // Prevent default behavior to avoid any side effects
    event.preventDefault();
  }, []);

  useEffect(() => {
    if (isListening) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      scannerInputRef.current = ''; // Clear input when stopping listening
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening, handleKeyDown]);

  return (
    <Layout>
      <div className="printer-config-page">
        <h1 className="page-title">Printer Configuration</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}
        {message && <MessagePopup message={message} onClose={() => setMessage(null)} />}

        <div className="config-container">
          <div className="printer-selection-row">
            <label htmlFor="printer-select">Select a Printer:</label>
            <select
              id="printer-select"
              value={selectedPrinterUid}
              onChange={handlePrinterChange}
            >
              <option value="">-- Select Printer --</option>
              {printers.map((printer) => (
                <option key={printer.uid} value={printer.uid || printer.connection}>
                  {printer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button onClick={testPrinterConnectivity}>Test Connectivity</button>
            <button onClick={saveDefaultPrinter}>Save as Default</button>
            <button onClick={fetchAvailablePrinters}>Refresh Printer List</button>
          </div>

          <table className="info-table">
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Current Default Printer:</td>
                <td>{defaultPrinterUid || 'None'}</td>
              </tr>
              <tr>
                <td>Browser Print SDK Version:</td>
                <td>3.1.250-min</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Scanner Configuration Section */}
        <h1 className="page-title">Scanner Configuration</h1>
        <hr className="page-divider" />

        <div className="scanner-config-container">
          <button onClick={() => setIsListening(!isListening)}>
            {isListening ? 'Stop Scanner Listening' : 'Start Scanner Listening'}
          </button>
          {isListening && <p>Listening for scanner input...</p>}
        </div>
      </div>
    </Layout>
  );
};

export default DeviceConfigurationPage;
