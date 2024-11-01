// ./src/utils/SolidInventoryItemPrintUtil.ts

import apiClient from "../../config/axiosConfig";

interface SolidInventoryItem {
  id: number;
  inventoryItemId: string;
  name: string;
  location: {
    name: string;
  };
}

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

interface Printer {
  name: string;
  uid: string;
  connection: string;
  deviceType: string;
  provider?: string;
  manufacturer?: string;
  model?: string;
}

interface PrinterConfig {
  defaultPrinterName: string;
  defaultPrinterConnection: string;
  defaultDeviceType: string;
  defaultPrinterUid: string;
  defaultPrinterProvider?: string | null;
  defaultPrinterManufacturer?: string | null;
  defaultPrinterModel?: string | null;
}

class SolidInventoryItemPrintUtil {
  private printerDevice: any = null;

  public async printLabel(item: SolidInventoryItem) {
    try {
      await this.init(); // Await initialization
      const zplString = await this.fetchZplForItem(item);
      this.sendToPrinter(zplString);
    } catch (error: any) {
      alert('Error printing label: ' + error.message);
    }
  }

  private async init() {
    try {
      const response = await apiClient.get('/system/print/default-printer');
      const printerConfig: PrinterConfig = response.data;
  
      if (!printerConfig || !printerConfig.defaultPrinterUid) {
        throw new Error('No default printer configured.');
      }
  
      // Map the printerConfig to a printer object
      const printer: Printer = {
        name: printerConfig.defaultPrinterName,
        uid: printerConfig.defaultPrinterUid,
        connection: printerConfig.defaultPrinterConnection,
        deviceType: printerConfig.defaultDeviceType,
        provider: printerConfig.defaultPrinterProvider || 'usb',
        manufacturer: printerConfig.defaultPrinterManufacturer || 'Unknown',
        model: printerConfig.defaultPrinterModel || 'Unknown',
      };
  
      // Adjust the connection string
      printer.connection = this.adjustConnectionString(printer);
  
      // Initialize the printer device
      if (window.BrowserPrint && window.BrowserPrint.Device) {
        this.printerDevice = new window.BrowserPrint.Device(printer);
  
        // Attempt a test command to check authorization
        await this.checkDeviceAuthorization();
      } else {
        throw new Error('BrowserPrint SDK is not available.');
      }
    } catch (error: any) {
      throw new Error(
        'Error initializing printer: ' +
          (error.response?.data?.message || error.message)
      );
    }
  }
  
  private adjustConnectionString(printer: Printer): string {
    let connection = printer.connection;
    if (connection.toLowerCase() === 'usb') {
      connection = `usb://${printer.name}`;
    } else if (connection.toLowerCase() === 'network') {
      connection = `tcp://${printer.uid}`;
    } else if (!connection.includes('://')) {
      connection = `usb://${printer.name}`;
    }
    return connection;
  }
  
  private async checkDeviceAuthorization() {
    return new Promise<void>((resolve, reject) => {
      this.printerDevice.sendThenRead(
        '~HQES', // Command to get printer status
        (response: any) => {
          console.log('Printer is authorized and connected.');
          resolve();
        },
        (error: any) => {
          if (error.includes('Unauthorized device detected')) {
            alert('Please authorize the printer in the Browser Print application settings.');
          }
          reject(new Error(error));
        }
      );
    });
  }

  private async fetchZplForItem(item: SolidInventoryItem): Promise<string> {
    const requestData = {
      itemId: item.id,
      inventoryItemId: item.inventoryItemId,
      name: item.name,
      location: item.location.name,
    };

    const response = await apiClient.post('/system/print/item', requestData);
    return response.data.zplString;
  }

  private sendToPrinter(zplString: string) {
    if (this.printerDevice) {
      this.printerDevice.send(
        zplString,
        () => {
          console.log('Print successful');
        },
        (errorMessage: any) => {
          alert('Error printing: ' + errorMessage);
        }
      );
    } else {
      alert('Printer not initialized');
    }
  }
}

export default SolidInventoryItemPrintUtil;
