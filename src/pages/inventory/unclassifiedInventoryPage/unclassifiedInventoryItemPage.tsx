/**
 * @author Dakota Soares
 * @version 1.2
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
import { printUnclassifiedInventoryItemLabel } from '../../../utils/printerUtils';
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
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showPrintLabelPopup, setShowPrintLabelPopup] = useState<boolean>(false);
  const [addedItem, setAddedItem] = useState<UnclassifiedInventoryItem | null>(null);

  const columns = ['Inventory Item', 'Name', 'Location Name', 'Category Name'];

  const fetchInventoryItems = useCallback(async () => {
    try {
      const response = await apiClient.get('/inventory/unclassified/pageable', {
        params: { searchColumn: 'Inventory Item', searchValue: searchTerm, page, size },
      });
      setInventoryItems(response.data.content);
      setTotalPages(response.data.totalPages);
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
      const response = await apiClient.post('/inventory/unclassified', data);
      const newItemId = response.data.id;

      //We do not need to call the POST /inventory/notification API here because
      //unclassified items do not have low quantity status notifications.

      const itemResponse = await apiClient.get(`/inventory/unclassified/${newItemId}`);
      const newItem = itemResponse.data;

      fetchInventoryItems();
      setShowAddPopup(false);
      setMessage('Message: Inventory item added successfully.');
      setAddedItem(newItem);
      setShowPrintLabelPopup(true);
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

  const handleDeleteItem = async (id: number) => {
    try {
      await apiClient.delete(`/inventory/unclassified/${id}`);
      fetchInventoryItems();
      setMessage('Message: Inventory item deleted successfully.');
    } catch (err) {
      setError('Error: Could not delete the inventory item.');
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

  const handleBulkTransfer = async (inventoryType: string) => {
  };

  const handleBulkPrint = async () => {
    if (selectedItems.size < 1 || selectedItems.size > 50) {
      setError('Error: Please select between 1 and 50 items.');
      return;
    }

    try {
      const itemsToPrint = inventoryItems.filter((item) => selectedItems.has(item.id));
      for (const item of itemsToPrint) {
        await printUnclassifiedInventoryItemLabel(item);
      }
      setMessage('Message: Bulk print completed successfully.');
    } catch (err) {
      setError('Error: Could not complete bulk print.');
    } finally {
      setSelectedItems(new Set());
    }
  };

  const handlePrintLabel = async (item: UnclassifiedInventoryItem) => {
    try {
      await printUnclassifiedInventoryItemLabel(item);
      setMessage('Message: Label printed successfully.');
    } catch (err) {
      setError('Error: Could not print label.');
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

  const viewDetails = (id: number) => {
    window.location.href = `/inventory/unclassified/${id}`;
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

  const clearSelections = () => {
    setSelectedItems(new Set());
    setMessage('Message: All user selections have been cleared successfully');
  };

  return (
    <Layout>
      <div className="unclassified-inventory-page">
        <h1 className="page-title">Unclassified Chemical Inventory</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}
        {message && <MessagePopup message={message} onClose={() => setMessage(null)} />}

        <div className="button-container">
          <button className="add-inventory-button" onClick={() => setShowAddPopup(true)}>Add Inventory</button>
          <button className="bulk-print-button" onClick={handleBulkPrint}>Bulk Print</button>
          <button className="bulk-transfer-button" onClick={() => handleBulkTransfer('LIQUID')}>Bulk Transfer</button>
          <button className="clear-selection-button" onClick={clearSelections}>Clear Selection</button>
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
                <td>{item.location?.name}</td>
                <td>{item.category?.name}</td>
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
                        label: 'Update Details',
                        onClick: () => openUpdateDetailsPopup(item),
                      },
                      {
                        label: 'View Details',
                        onClick: () => viewDetails(item.id),
                      },
                      {
                        label: 'Transfer Item',
                        onClick: () => openTransferPopup(item),
                      },
                      {
                        label: 'Print Label',
                        onClick: () => handlePrintLabel(item),
                      },
                      {
                        label: 'Delete Item',
                        onClick: () => handleDeleteItem(item.id),
                      },
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
            <button onClick={() => setPage(page - 1)} disabled={page === 0}>
              &lt;
            </button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages}>
              &gt;
            </button>
          </div>
          <button
            className="go-to-top-button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Go to Top
          </button>
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
          <Popup title="Update Inventory Details" onClose={() => setShowUpdateDetailsPopup(false)}>
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

        {showPrintLabelPopup && addedItem && (
          <Popup title="Print Label" onClose={() => setShowPrintLabelPopup(false)}>
            <p>Inventory Item Added Successfully. Would you like to print a label for this item?</p>
            <div className="form-actions">
              <button
                onClick={() => {
                  handlePrintLabel(addedItem);
                  setShowPrintLabelPopup(false);
                }}
              >Yes</button>
              <button onClick={() => setShowPrintLabelPopup(false)}>No</button>
            </div>
          </Popup>
        )}
      </div>
    </Layout>
  );
};

const InventoryForm: React.FC<{
  locations: Location[];
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ locations, categories, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [casNumber, setCasNumber] = useState('');
  const [locationId, setLocationId] = useState<number>(locations[0]?.id || 0);
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0);

  const handleSubmit = () => {
    const data = {
      type: 'LIQUID',
      name,
      casNumber,
      location: { id: locationId },
      category: { id: categoryId },
    };
    onSubmit(data);
  };

  return (
    <div className="inventory-form">
      <label>Name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

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

      <label>CAS Number</label>
      <input
        type="text"
        value={casNumber}
        onChange={(e) => setCasNumber(e.target.value)}
      />

      <div className="form-actions">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

const UpdateDetailsForm: React.FC<{
  item: UnclassifiedInventoryItem;
  locations: Location[];
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ item, locations, categories, onSubmit, onCancel }) => {
  const [name, setName] = useState(item.name || '');
  const [casNumber, setCasNumber] = useState(item.casNumber || '');
  const [locationId, setLocationId] = useState<number>(item.location.id);
  const [categoryId, setCategoryId] = useState<number>(item.category.id);

  const handleSubmit = () => {
    const data = {
      name,
      casNumber,
      locationId,
      categoryId,
    };
    onSubmit(data);
  };

  return (
    <div className="update-details-form">
      <label>Name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

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
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

const TransferItemForm: React.FC<{
  onSubmit: (inventoryType: string) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [inventoryType, setInventoryType] = useState<string>('LIQUID');

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
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default UnclassifiedInventoryItemPage;
