/**
 * @author Dakota Soares
 * @version 1.1
 * @description Global Type Definitions
 */

export interface Location {
    id: number;
    locationId: string | null;
    name: string;
    description: string;
    createTime: string;
  }
  
export interface Category {
    id: number;
    categoryId: string;
    name: string;
    description: string;
    createTime: string;
  }

  export interface InventoryItemNotification {
    id: number;
    itemId: number;
    lowQuantityAlarm: boolean;
  }

export interface SolidInventoryItem {
    id: number;
    inventoryItemId: string;
    name: string;
    location: Location;
    category: Category;
    status: string;
    currentQuantityAmount: number;
    quantityUnit: string;
    casNumber: string;
  }

  export interface LiquidInventoryItem {
    id: number;
    inventoryItemId: string;
    name: string;
    location: Location;
    category: Category;
    status: string;
    currentQuantityAmount: number;
    quantityUnit: string;
    casNumber: string;
  }
  
  export interface SolidInventoryItemDetails {
    id: number;
    inventoryItemId: string;
    name: string;
    type: string | null;
    importDate: string;
    location: Location;
    category: Category;
    status: string;
    casNumber: string;
    expirationDate: string;
    originalQuantityAmount: number;
    currentQuantityAmount: number;
    quantityUnit: string;
    inventoryItemNotification?: InventoryItemNotification;
  }

  export interface LiquidInventoryItemDetails {
    id: number;
    inventoryItemId: string;
    name: string;
    type: string | null;
    importDate: string;
    location: Location;
    category: Category;
    status: string;
    casNumber: string;
    expirationDate: string;
    originalQuantityAmount: number;
    currentQuantityAmount: number;
    quantityUnit: string;
    inventoryItemNotification?: InventoryItemNotification;
  }

  export interface UnclassifiedInventoryItem {
    id: number;
    inventoryItemId: string;
    name: string;
    type: string | null;
    location: Location;
    category: Category;
    casNumber: string;
  }
  
  export interface Note {
    id: number;
    inventoryItemId: number;
    content: string;
  }

  export interface User {
    id: number;
    userName: string;
    isDisabled: boolean;
    userRole: string;
    createTime: string;
  }

  export interface Printer {
    name: string;
    uid: string;
    connection: string;
    sendThenRead: (
      data: string,
      successCallback: (response: any) => void,
      errorCallback: (error: any) => void
    ) => void;
  }

  export interface Unit {
    id: number;
    quantityUnit: string;
    quantityUnitCode: string;
  }