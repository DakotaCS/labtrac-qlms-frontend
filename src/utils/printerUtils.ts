/**
 * @author Dakota Soares
 * @version 1.1
 * @description  Handles all printing functinality, including: 
 * - Single label printing for all components 
 * - Bulk label printing for all components
 */

import apiClient from '../config/axiosConfig';
import { SolidInventoryItem } from '../components/types'

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

export const getAvailablePrinters = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!window.BrowserPrint) {
      reject('BrowserPrint SDK not found');
      return;
    }
    window.BrowserPrint.getLocalDevices(
      (printers: any[]) => {
        resolve(printers);
      },
      (error: any) => {
        reject(error);
      },
      'printer'
    );
  });
};

export const sendZplToPrinter = (printer: any, zpl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    printer.send(zpl, resolve, reject);
  });
};

export const printLabel = async (item: SolidInventoryItem): Promise<void> => {
  try {
    const zplResponse = await apiClient.post('/system/print/item', {
      itemId: item.id,
      inventoryItemId: item.inventoryItemId,
      name: item.name,
      location: item.location.name,
    });
    const zplString = zplResponse.data.zplString;

    const defaultPrinterResponse = await apiClient.get('/system/print/default-printer');
    const defaultPrinterUid = defaultPrinterResponse.data.defaultPrinterUid;

    const printers = await getAvailablePrinters();
    const selectedPrinter = printers.find(
      (printer: any) =>
        printer.uid === defaultPrinterUid || printer.connection === defaultPrinterUid
    );

    if (!selectedPrinter) {
      throw new Error('Default printer not found');
    }

    await sendZplToPrinter(selectedPrinter, zplString);
  } catch (error) {
    throw error;
  }
};
