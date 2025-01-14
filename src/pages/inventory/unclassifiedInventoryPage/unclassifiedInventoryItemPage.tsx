/**
 * @author Dakota Soares
 * @version 1.1
 * @description Unclassified Inventory Item Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../config/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import Popup from '../../../components/Popup/Popup';
import MeatballMenu from '../../../components/MeatballMenu/MeatballMenu';
import CustomDropdown from '../../../components/CustomDropdown/CustomDropdown';
import SearchBarWithFilter from '../../../components/SearchBarWithFilter/SearchBarWithFilter';
import MessagePopup from '../../../components/MessagePopup/MessagePopup';
import { Category, Location, UnclassifiedInventoryItem } from '../../../components/types';
import './unclassifiedInventoryItemPage.css';

const UnclassifiedInventoryItemPage: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<UnclassifiedInventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [showUpdateDetailsPopup, setShowUpdateDetailsPopup] = useState<boolean>(false);
  const [showTransferPopup, setShowTransferPopup] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<UnclassifiedInventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(100);
  const [totalPages, setTotalPages] = useState<number>(1);

  const columns = ['Inventory Item', 'Name', 'Location Name', 'Category Name'];

  const fetchInventoryItems = useCallback(async () => {
    try {
      const response = await apiClient.get('/inventory/unclassified/pageable', {
        params: { searchColumn: 'Inventory Item', searchValue: searchTerm, page, size },
      });
      setInventoryItems(response.data.content);
    } catch (err) {
      setError('Error: Could not retrieve the inventory item list.');
    }
  }, [searchTerm, page, size]);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/location');
      setLocations(response.data);
    } catch (err) {
      setError('Error: Could not retrieve the location list.');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/category');
      setCategories(response.data);
    } catch (err) {
      setError('Error: Could not retrieve the category list.');
    }
  }, []);

  useEffect(() => {
    fetchInventoryItems();
    fetchLocations();
    fetchCategories();
  }, [fetchInventoryItems, fetchLocations, fetchCategories]);

  const handleAddInventoryItem = async (data: any) => {
    try {
      await apiClient.post('/inventory/unclassified', data);
      fetchInventoryItems();
      setShowAddPopup(false);
      setMessage('Message: Inventory item added successfully.');
    } catch (err) {
      setError('Error: The inventory item could not be added.');
    }
  };

  const handleUpdateDetails = async (id: number, data: any) => {
    try {
      await apiClient.patch(`/inventory/unclassified/${id}`, data);
      fetchInventoryItems();
      setShowUpdateDetailsPopup(false);
      setMessage('Message: Inventory item details updated successfully.');
    } catch (err) {
      setError('Error: Could not update the inventory item details.');
    }
  };

  const handleTransferItem = async (id: number, inventoryType: string) => {
    try {
      await apiClient.post(`/inventory/unclassified/${id}/transfer`, { inventoryType });
      fetchInventoryItems();
      setShowTransferPopup(false);
      setMessage('Message: Inventory item transferred successfully.');
    } catch (err) {
      setError('Error: Could not transfer the inventory item.');
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await apiClient.delete(`/inventory/unclassified/${id}`);
      fetchInventoryItems();
      setMessage('Message: Inventory item deleted successfully.');
    } catch (err) {
      setError('Error: Could not delete the inventory item.');
    }
  };

  const openUpdateDetailsPopup = (item: UnclassifiedInventoryItem) => {
    setSelectedItem(item);
    setShowUpdateDetailsPopup(true);
  };

  const openTransferPopup = (item: UnclassifiedInventoryItem) => {
    setSelectedItem(item);
    setShowTransferPopup(true);
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

  return (
    <Layout>
      <div className="unclassified-inventory-page">
        <h1 className="page-title">Unclassified Chemical Inventory</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}
        {message && <MessagePopup message={message} onClose={() => setMessage(null)} />}

        <div className="button-container">
          <button className="add-inventory-button" onClick={() => setShowAddPopup(true)}>
            Add Inventory
          </button>
          <button className="bulk-print-button">Bulk Print</button>
          <button className="bulk-transfer-button">Bulk Transfer</button>
          <SearchBarWithFilter
          columns={columns}
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(0);
          }}
          onFilterChange={() => {}}
        />
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th>Bulk Actions</th>
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
                      { label: 'Update Details', onClick: () => openUpdateDetailsPopup(item) },
                      { label: 'View Details', onClick: () => (window.location.href = `/inventory/unclassified/${item.id}`) },
                      { label: 'Delete Item', onClick: () => handleDeleteItem(item.id) },
                      { label: 'Print Label', onClick: () => {} },
                      { label: 'Transfer Item', onClick: () => openTransferPopup(item) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="pagination-container">
          <div className="pagination-controls">
            <button onClick={() => setPage(page - 1)} disabled={page === 0}>&lt;</button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages}>&gt;</button>
          </div>
          <button className="go-to-top-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >Go to Top</button>
        </div>

        {showAddPopup && (
          <Popup title="Add Inventory" onClose={() => setShowAddPopup(false)}>
            <InventoryForm
              locations={locations}
              categories={categories}
              onSubmit={handleAddInventoryItem}
              onCancel={() => setShowAddPopup(false)}
            />
          </Popup>
        )}

        {showUpdateDetailsPopup && selectedItem && (
          <Popup title="Update Details" onClose={() => setShowUpdateDetailsPopup(false)}>
            <UpdateDetailsForm
              item={selectedItem}
              locations={locations}
              categories={categories}
              onSubmit={(data) => handleUpdateDetails(selectedItem.id, data)}
              onCancel={() => setShowUpdateDetailsPopup(false)}
            />
          </Popup>
        )}

        {showTransferPopup && selectedItem && (
          <Popup title="Transfer Item" onClose={() => setShowTransferPopup(false)}>
            <TransferItemForm
              onSubmit={(inventoryType) => handleTransferItem(selectedItem.id, inventoryType)}
              onCancel={() => setShowTransferPopup(false)}
            />
          </Popup>
        )}
      </div>
    </Layout>
  );
};

interface InventoryFormProps {
  locations: Location[];
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  locations,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [casNumber, setCasNumber] = useState('');
  const [locationId, setLocationId] = useState<number>(locations[0]?.id || 0);
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0);

  const handleSubmit = () => {
    const data = {
      casNumber,
      location: { id: locationId },
      category: { id: categoryId },
    };
    onSubmit(data);
  };

  return (
    <div className="inventory-form">
      <label>CAS Number</label>
      <input type="text" value={casNumber} onChange={(e) => setCasNumber(e.target.value)} />

      <label>Storage Location</label>
      <CustomDropdown
        options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
        value={locationId}
        onChange={(value) => setLocationId(value)}
      />

      <label>Chemical Category</label>
      <CustomDropdown
        options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        value={categoryId}
        onChange={(value) => setCategoryId(value)}
      />

      <div className="form-actions">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

interface UpdateDetailsFormProps {
  item: UnclassifiedInventoryItem;
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
  const [casNumber, setCasNumber] = useState(item.casNumber || '');
  const [locationId, setLocationId] = useState<number>(item.location.id);
  const [categoryId, setCategoryId] = useState<number>(item.category.id);

  const handleSubmit = () => {
    const data = {
      casNumber,
      locationId,
      categoryId,
    };
    onSubmit(data);
  };

  return (
    <div className="update-details-form">
      <label>CAS Number</label>
      <input type="text" value={casNumber} onChange={(e) => setCasNumber(e.target.value)} />

      <label>Storage Location</label>
      <CustomDropdown
        options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
        value={locationId}
        onChange={(value) => setLocationId(value)}
      />

      <label>Chemical Category</label>
      <CustomDropdown
        options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        value={categoryId}
        onChange={(value) => setCategoryId(value)}
      />

      <div className="form-actions">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

interface TransferItemFormProps {
  onSubmit: (inventoryType: string) => void;
  onCancel: () => void;
}

const TransferItemForm: React.FC<TransferItemFormProps> = ({ onSubmit, onCancel }) => {
  const [inventoryType, setInventoryType] = useState<string>('');

  const handleSubmit = () => {
    onSubmit(inventoryType);
  };

  return (
    <div className="transfer-item-form">
      <label>Transfer Item to:</label>
      <CustomDropdown
        options={[
          { value: 'SOLID', label: 'Solid' },
          { value: 'LIQUID', label: 'Liquid' },
        ]}
        value={inventoryType}
        onChange={(value) => setInventoryType(value)}
      />
      <div className="form-actions">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default UnclassifiedInventoryItemPage;
