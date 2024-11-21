/**
 * @author Dakota Soares
 * @version 1.1
 * @description Device Config Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../config/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import MessagePopup from '../../../components/MessagePopup/MessagePopup';
import { Printer } from '../../../components/types';
import './deviceConfigurationPage.css';

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

const DeviceConfigurationPage: React.FC = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinterUid, setSelectedPrinterUid] = useState<string>('');
  const [defaultPrinterUid, setDefaultPrinterUid] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDefaultPrinter = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/print/default-printer');
      setDefaultPrinterUid(response.data.defaultPrinterUid);
      setSelectedPrinterUid(response.data.defaultPrinterUid);
    } catch (err: any) {
      setError('Error: The default printer could not be found or is not set.');
    }
  }, []);

  const fetchAvailablePrinters = useCallback(() => {
    if (!window.BrowserPrint) {
      setError('Error: Zebra Browser Print SDK not found.');
      return;
    }

    window.BrowserPrint.getLocalDevices(
      (devices: any[]) => {
        const printerDevices = devices.filter(
          (device) => device.connection === 'usb' || device.connection === 'network'
        );
        setPrinters(printerDevices);
        setMessage('Message: Printer list refreshed');
      },
      (error: any) => {
        setError('Error: Printer list retrieval failed');
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
      setMessage('Message: Default Printer saved successfully');
      setDefaultPrinterUid(selectedPrinterUid);
    } catch (err: any) {
      setError('Message: Default printer save failed');
    }
  };

  const testPrinterConnectivity = () => {
    const printer = printers.find(
      (p) => p.uid === selectedPrinterUid || p.connection === selectedPrinterUid
    );
    if (!printer) {
      setMessage('Error: Selected Printer not found');
      return;
    }

    printer.sendThenRead(
      '~HQES', // ZPL Printer Status command
      (response: any) => {
        setMessage('Message: Printer connection succeeded');
      },
      (error: any) => {
        setError('Error: Printer communication failed');
      }
    );
  };

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

        <h1 className="page-title">Scanner Configuration</h1>
        <hr className="page-divider" />

        <div className="scanner-config-container">
        <table className="info-table">
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Scanner Settings</td>
                <td>All 2D Scanners set to 'Real-Time' Mode using a US Keyboard Layout over 2.4Ghz or wired connections 
                  are compatible with this application. USB-COM/Virtual Serial Port settings are not supported. </td>
              </tr>
              <tr>
                <td>Scanner Compatibility</td>
                <td>Tera 8100, 8100Y, HWOO15, HWOOO7-BT, HWOOO6 Pro, D5100, D5100Y</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default DeviceConfigurationPage;
