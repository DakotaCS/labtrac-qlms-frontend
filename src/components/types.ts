// Types

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