// ./src/pages/SolidChemicalInventoryPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout/Layout';
import ErrorPopup from '../../components/ErrorPopup/ErrorPopup';
import Popup from '../../components/Popup/Popup';
import './solidInventoryItemPage.css';

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

const SolidInventoryItemPage: React.FC = () => {
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
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchInventoryItems();
    fetchLocations();
    fetchCategories();
    fetchUnits();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend.labtrac.quantuslms.ca/api/inventory/solid', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInventoryItems(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend.labtrac.quantuslms.ca/api/system/location', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLocations(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend.labtrac.quantuslms.ca/api/system/category', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend.labtrac.quantuslms.ca/api/system/unit/solid', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUnits(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleError = (err: any) => {
    const errorMessage = `Error: ${err.response?.status} - ${err.response?.data?.message || err.message}`;
    setError(errorMessage);
  };

  const handleAddInventoryItem = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://backend.labtrac.quantuslms.ca/api/inventory/solid', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchInventoryItems();
      setShowAddPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateQuantity = async (id: number, quantityUsed: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://backend.labtrac.quantuslms.ca/api/inventory/solid/${id}/quantity`,
        { quantityUsed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchInventoryItems();
      setShowUpdateQuantityPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateDetails = async (id: number, data: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://backend.labtrac.quantuslms.ca/api/inventory/solid/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchInventoryItems();
      setShowUpdateDetailsPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://backend.labtrac.quantuslms.ca/api/inventory/solid/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <Layout>
      <div className={`solid-inventory-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">Solid Chemical Inventory</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}

        <div className="button-container">
          <button className="add-inventory-button" onClick={() => setShowAddPopup(true)}>
            Add Inventory
          </button>
          <button className="bulk-print-button">Bulk Print</button>
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
                <td className="meatball-menu-container">
                  <button className="meatball-menu" onClick={() => toggleMenu(item.id)}>
                    ⋮
                  </button>
                  {activeMenu === item.id && (
                    <div className="meatball-menu-options" ref={menuRef}>
                      <button className="menu-option" onClick={() => openUpdateQuantityPopup(item)}>
                        Update Quantity
                      </button>
                      <button className="menu-option" onClick={() => openUpdateDetailsPopup(item)}>
                        Update Details
                      </button>
                      <button className="menu-option" onClick={() => viewDetailedInfo(item.id)}>
                        View Details
                      </button>
                      <button className="menu-option" onClick={() => handleDeleteItem(item.id)}>
                        Delete Item
                      </button>
                    </div>
                  )}
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
          <Popup title="Update Quantity" onClose={() => setShowUpdateQuantityPopup(false)}>
            <UpdateQuantityForm
              onSubmit={(quantityUsed) => handleUpdateQuantity(selectedItem.id, quantityUsed)}
              onCancel={() => setShowUpdateQuantityPopup(false)}
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

const InventoryForm: React.FC<InventoryFormProps> = ({ locations, categories, units, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [importDate, setImportDate] = useState<string>(new Date().toISOString().split('T')[0]);
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
      <input type="date" value={importDate} onChange={(e) => setImportDate(e.target.value)} required />

      <label>Storage Location</label>
      <select value={locationId} onChange={(e) => setLocationId(Number(e.target.value))}>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      <label>Chemical Category</label>
      <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <label>Expiry Date</label>
      <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required />

      <label>CAS Number</label>
      <input type="text" value={casNumber} onChange={(e) => setCasNumber(e.target.value)} />

      <label>Quantity</label>
      <input
        type="number"
        value={originalQuantityAmount}
        onChange={(e) => setOriginalQuantityAmount(Number(e.target.value))}
        required
      />

      <label>Units</label>
      <select value={quantityUnit} onChange={(e) => setQuantityUnit(e.target.value)}>
        {units.map((unit) => (
          <option key={unit.quantityUnitCode} value={unit.quantityUnit}>
            {unit.quantityUnit}
          </option>
        ))}
      </select>

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

const UpdateQuantityForm: React.FC<UpdateQuantityFormProps> = ({ onSubmit, onCancel }) => {
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
      <input type="text" value={casNumber} onChange={(e) => setCasNumber(e.target.value)} />

      <label>Storage Location</label>
      <select value={locationId} onChange={(e) => setLocationId(Number(e.target.value))}>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      <label>Chemical Category</label>
      <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <div className="form-actions">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default SolidInventoryItemPage;
