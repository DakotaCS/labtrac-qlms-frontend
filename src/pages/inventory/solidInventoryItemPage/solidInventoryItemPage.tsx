// ./src/pages/solidInventoryItemPage/solidInventoryItemPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../config/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import Popup from '../../../components/Popup/Popup';
import MeatballMenu from '../../../components/MeatballMenu/MeatballMenu';
import CustomDropdown from '../../../components/CustomDropdown/CustomDropdown';
import SearchBarWithFilter from '../../../components/SearchBarWithFilter/SearchBarWithFilter';
import MessagePopup from '../../../components/MessagePopup/MessagePopup';
import { printLabel } from '../../../utils/printerUtils';
import { SolidInventoryItem, Category, Location } from '../../../components/types';
import './solidInventoryItemPage.css';

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

interface Unit {
  quantityUnit: string;
  quantityUnitCode: string;
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
  const [message, setMessage] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const columns = [
    'Inventory Item',
    'Name',
    'Location Name',
    'Category Name',
    'Status',
    'Current Quantity',
    'Unit',
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('Inventory Item');

  const handleError = useCallback((err: any) => {
    const errorMessage = `Error: ${err.response?.status} - ${
      err.response?.data?.message || err.message
    }`;
    setError(errorMessage);
  }, []);

  const fetchInventoryItems = useCallback(
    async (
      searchColumn = 'Inventory Item',
      searchValue = '',
      page = 0,
      size = 10
    ) => {
      try {
        const params = {
          searchColumn: searchColumn,
          searchValue: searchValue,
          page: page,
          size: size,
        };

        const response = await apiClient.get('/inventory/solid/pageable', {
          params,
        });
        setInventoryItems(response.data.content);
      } catch (err: any) {
        handleError(err);
      }
    },
    [handleError]
  );

  const fetchLocations = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/location');
      setLocations(response.data);
    } catch (err: any) {
      handleError(err);
    }
  }, [handleError]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/category');
      setCategories(response.data);
    } catch (err: any) {
      handleError(err);
    }
  }, [handleError]);

  const fetchUnits = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/unit/solid');
      setUnits(response.data);
    } catch (err: any) {
      handleError(err);
    }
  }, [handleError]);

  useEffect(() => {
    fetchInventoryItems();
    fetchLocations();
    fetchCategories();
    fetchUnits();
  }, [fetchInventoryItems, fetchLocations, fetchCategories, fetchUnits]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInventoryItems(searchColumn, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchColumn, fetchInventoryItems]);

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
      await printLabel(item);
      setMessage('Label printed successfully');
    } catch (error) {
      setError('Failed to print label:\n' + error);
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleBulkPrint = async () => {
    if (selectedItems.size < 1 || selectedItems.size > 50) {
      setError('Please select between 1 and 50 items to print.');
      return;
    }
  
    try {
      const itemsToPrint = inventoryItems.filter(item => selectedItems.has(item.id));
      for (const item of itemsToPrint) {
        await printLabel(item);
      }
      setMessage('Bulk printing completed successfully.');
    } catch (error) {
      setError('Failed to complete bulk printing:\n' + error);
    } finally {
      setSelectedItems(new Set());
    }
  };

  const clearSelections = () => {
    setSelectedItems(new Set());
    setMessage('All selections have been cleared.');
  };

  return (
    <Layout>
      <div className={`solid-inventory-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">Solid Chemical Inventory</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}
        {message && <MessagePopup message={message} onClose={() => setMessage(null)} />}

        <div className="button-container">
          <div className="button-group">
            <button className="add-inventory-button" onClick={() => setShowAddPopup(true)}>Add Inventory</button>
            <button className="bulk-print-button" onClick={handleBulkPrint}>Bulk Print</button>
            <button className="clear-selection-button" onClick={clearSelections}>Clear Selection</button>
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
              <th>Print</th>
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
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelectItem(item.id)}
                  />
                </td>
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
                        onClick: () => handlePrintLabel(item),
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
