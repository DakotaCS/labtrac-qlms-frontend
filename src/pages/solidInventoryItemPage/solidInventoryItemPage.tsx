// ./src/pages/solidInventoryItemPage/solidInventoryItemPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig';
import Layout from '../../components/Layout/Layout';
import ErrorPopup from '../../components/ErrorPopup/ErrorPopup';
import Popup from '../../components/Popup/Popup';
import MeatballMenu from '../../components/MeatballMenu/MeatballMenu';
import './solidInventoryItemPage.css';
import CustomDropdown from '../../components/CustomDropdown/CustomDropdown';
import SearchBarWithFilter from '../../components/SearchBarWithFilter/SearchBarWithFilter';

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

interface Location {
  id: number;
  locationId: string | null;
  name: string;
  description: string;
  createTime: string;
}

interface Category {
  id: number;
  categoryId: string;
  name: string;
  description: string;
  createTime: string;
}

interface Unit {
  quantityUnit: string;
  quantityUnitCode: string;
}

interface SolidInventoryItem {
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

const SolidChemicalInventoryPage: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<SolidInventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [showUpdateQuantityPopup, setShowUpdateQuantityPopup] = useState<boolean>(false);
  const [showUpdateDetailsPopup, setShowUpdateDetailsPopup] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SolidInventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuCollapsed] = useState(false);

  const columns = [
    'Inventory Item',
    'Name',
    'Location Name',
    'Category Name',
    'Status',
    'Current Quantity',
    'Unit',
  ];

  const columnMap: { [key: string]: string } = {
    'Inventory Item': 'inventoryItemId',
    Name: 'name',
    'Location Name': 'locationName',
    'Category Name': 'categoryName',
    Status: 'status',
    'Current Quantity': 'currentQuantityAmount',
    Unit: 'quantityUnit',
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('Inventory Item');

  useEffect(() => {
    fetchInventoryItems();
    fetchLocations();
    fetchCategories();
    fetchUnits();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInventoryItems(searchColumn, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchColumn]);

  const fetchInventoryItems = async (
    searchColumn = 'inventoryItemId',
    searchValue = '',
    page = 0,
    size = 10
  ) => {
    try {
      const url = new URL('/inventory/solid/pageable', apiClient.defaults.baseURL);
      url.searchParams.append('searchColumn', columnMap[searchColumn]);
      url.searchParams.append('searchValue', searchValue);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());

      const response = await apiClient.get(url.pathname + url.search);
      setInventoryItems(response.data.content);
    } catch (err: any) {
      handleError(err);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await apiClient.get('/system/location');
      setLocations(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/system/category');
      setCategories(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await apiClient.get('/system/unit/solid');
      setUnits(response.data);
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

  const handleAddInventoryItem = async (data: any) => {
    try {
      await apiClient.post('/inventory/solid', data);
      fetchInventoryItems();
      setShowAddPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateQuantity = async (id: number, quantityUsed: number) => {
    try {
      await apiClient.patch(`/inventory/solid/${id}/quantity`, { quantityUsed });
      fetchInventoryItems();
      setShowUpdateQuantityPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateDetails = async (id: number, data: any) => {
    try {
      await apiClient.patch(`/inventory/solid/${id}`, data);
      fetchInventoryItems();
      setShowUpdateDetailsPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await apiClient.delete(`/inventory/solid/${id}`);
      fetchInventoryItems();
    } catch (err: any) {
      handleError(err);
    }
  };

  const openUpdateQuantityPopup = (item: SolidInventoryItem) => {
    setSelectedItem(item);
    setShowUpdateQuantityPopup(true);
  };

  const openUpdateDetailsPopup = (item: SolidInventoryItem) => {
    setSelectedItem(item);
    setShowUpdateDetailsPopup(true);
  };

  const viewDetailedInfo = (id: number) => {
    window.location.href = `/inventory/solid/${id}`;
  };

  const handlePrintLabel = async (item: SolidInventoryItem) => {
    try {
  
      // Prepare the request data
      const requestData = {
        itemId: item.id,
        inventoryItemId: item.inventoryItemId,
        name: item.name,
        location: item.location.name,
      };
  
      // Make the POST request to get the ZPL code
      const response = await apiClient.post('/system/print/item',requestData);
      
      const zplString = response.data.zplString;
  
      // Use the Zebra Browser Print SDK to send the zplString to the printer
      if (window.BrowserPrint && window.BrowserPrint.getDefaultDevice) {
        window.BrowserPrint.getDefaultDevice(
          'printer',
          (printer: any) => {
            if (printer) {
              printer.send(
                zplString,
                undefined,
                (errorMessage: any) => {
                  alert('Error printing: ' + errorMessage);
                }
              );
            } else {
              alert('No printer found');
            }
          },
          (error: any) => {
            alert('Error getting default printer: ' + error);
          }
        );
      } else {
        alert('BrowserPrint SDK is not available.');
      }
    } catch (error) {
      console.error('Error printing label:', error);
      alert('Error printing label');
    }
  };

  return (
    <Layout>
      <div className={`solid-inventory-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">Solid Chemical Inventory</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}

        <div className="button-container">
          <div className="button-group">
            <button
              className="add-inventory-button"
              onClick={() => setShowAddPopup(true)}
            >
              Add Inventory
            </button>
            <button className="bulk-print-button">Bulk Print</button>
            <SearchBarWithFilter
              columns={columns}
              onSearch={(term) => setSearchTerm(term)}
              onFilterChange={(filter) => setSearchColumn(filter)}
            />
          </div>
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Inventory Item</th>
              <th>Name</th>
              <th>Location Name</th>
              <th>Category Name</th>
              <th>Status</th>
              <th>Current Quantity</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((item) => (
              <tr key={item.id}>
                <td>{item.inventoryItemId}</td>
                <td>{item.name}</td>
                <td>{item.location.name}</td>
                <td>{item.category.name}</td>
                <td>{item.status}</td>
                <td>{item.currentQuantityAmount}</td>
                <td>{item.quantityUnit}</td>
                <td>
                  <MeatballMenu
                    options={[
                      {
                        label: 'Update Quantity',
                        onClick: () => openUpdateQuantityPopup(item),
                      },
                      {
                        label: 'Update Details',
                        onClick: () => openUpdateDetailsPopup(item),
                      },
                      {
                        label: 'View Details',
                        onClick: () => viewDetailedInfo(item.id),
                      },
                      {
                        label: 'Delete Item',
                        onClick: () => handleDeleteItem(item.id),
                      },
                      {
                        label: 'Print Label',
                        onClick: () => handlePrintLabel(item), // Added this line
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddPopup && (
          <Popup title="Add Inventory" onClose={() => setShowAddPopup(false)}>
            <InventoryForm
              locations={locations}
              categories={categories}
              units={units}
              onSubmit={handleAddInventoryItem}
              onCancel={() => setShowAddPopup(false)}
            />
          </Popup>
        )}

        {showUpdateQuantityPopup && selectedItem && (
          <Popup
            title="Update Quantity"
            onClose={() => setShowUpdateQuantityPopup(false)}
          >
            <UpdateQuantityForm
              onSubmit={(quantityUsed) =>
                handleUpdateQuantity(selectedItem.id, quantityUsed)
              }
              onCancel={() => setShowUpdateQuantityPopup(false)}
            />
          </Popup>
        )}

        {showUpdateDetailsPopup && selectedItem && (
          <Popup
            title="Update Details"
            onClose={() => setShowUpdateDetailsPopup(false)}
          >
            <UpdateDetailsForm
              item={selectedItem}
              locations={locations}
              categories={categories}
              onSubmit={(data) => handleUpdateDetails(selectedItem.id, data)}
              onCancel={() => setShowUpdateDetailsPopup(false)}
            />
          </Popup>
        )}
      </div>
    </Layout>
  );
};

// InventoryForm Component for Adding Inventory
interface InventoryFormProps {
  locations: Location[];
  categories: Category[];
  units: Unit[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  locations,
  categories,
  units,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [importDate, setImportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [locationId, setLocationId] = useState<number>(locations[0]?.id || 0);
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0);
  const [expirationDate, setExpirationDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 4);
    return date.toISOString().split('T')[0];
  });
  const [casNumber, setCasNumber] = useState('');
  const [originalQuantityAmount, setOriginalQuantityAmount] = useState<number>(0);
  const [quantityUnit, setQuantityUnit] = useState<string>(units[0]?.quantityUnit || '');

  const handleSubmit = () => {
    const data = {
      name,
      type: 'SOLID',
      importDate,
      location: { id: locationId },
      category: { id: categoryId },
      expirationDate,
      casNumber,
      originalQuantityAmount,
      quantityUnit,
    };
    onSubmit(data);
  };

  return (
    <div className="inventory-form">
      <label>Name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

      <label>Import Date</label>
      <input
        type="date"
        value={importDate}
        onChange={(e) => setImportDate(e.target.value)}
        required
      />

      <label>Storage Location</label>
      <CustomDropdown
        options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
        value={locationId}
        onChange={(value) => setLocationId(value)}
        placeholder="Select Location"
      />

      <label>Chemical Category</label>
      <CustomDropdown
        options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        value={categoryId}
        onChange={(value) => setCategoryId(value)}
        placeholder="Select Category"
      />

      <label>Expiry Date</label>
      <input
        type="date"
        value={expirationDate}
        onChange={(e) => setExpirationDate(e.target.value)}
        required
      />

      <label>CAS Number</label>
      <input
        type="text"
        value={casNumber}
        onChange={(e) => setCasNumber(e.target.value)}
      />

      <label>Quantity</label>
      <input
        type="number"
        value={originalQuantityAmount}
        onChange={(e) => setOriginalQuantityAmount(Number(e.target.value))}
        required
      />

      <label>Units</label>
      <CustomDropdown
        options={units.map((unit) => ({
          value: unit.quantityUnit,
          label: unit.quantityUnit,
        }))}
        value={quantityUnit}
        onChange={(value) => setQuantityUnit(value)}
        placeholder="Select Unit"
      />

      <div className="form-actions">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

// UpdateQuantityForm Component
interface UpdateQuantityFormProps {
  onSubmit: (quantityUsed: number) => void;
  onCancel: () => void;
}

const UpdateQuantityForm: React.FC<UpdateQuantityFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [quantityUsed, setQuantityUsed] = useState<number>(0);

  return (
    <div className="update-quantity-form">
      <label>Enter Quantity Used</label>
      <input
        type="number"
        value={quantityUsed}
        onChange={(e) => setQuantityUsed(Number(e.target.value))}
        required
      />
      <div className="form-actions">
        <button onClick={() => onSubmit(quantityUsed)}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

// UpdateDetailsForm Component
interface UpdateDetailsFormProps {
  item: SolidInventoryItem;
  locations: Location[];
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({
  item,
  locations,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(item.name);
  const [casNumber, setCasNumber] = useState(item.casNumber || '');
  const [locationId, setLocationId] = useState<number>(item.location.id);
  const [categoryId, setCategoryId] = useState<number>(item.category.id);

  const handleSubmit = () => {
    const data = {
      name,
      casNumber,
      categoryId,
      locationId,
    };
    onSubmit(data);
  };

  return (
    <div className="update-details-form">
      <label>Name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

      <label>CAS Number</label>
      <input
        type="text"
        value={casNumber}
        onChange={(e) => setCasNumber(e.target.value)}
      />

      <label>Storage Location</label>
      <CustomDropdown
        options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
        value={locationId}
        onChange={(value) => setLocationId(value)}
        placeholder="Select Location"
      />

      <label>Chemical Category</label>
      <CustomDropdown
        options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        value={categoryId}
        onChange={(value) => setCategoryId(value)}
        placeholder="Select Category"
      />

      <div className="form-actions">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default SolidChemicalInventoryPage;
