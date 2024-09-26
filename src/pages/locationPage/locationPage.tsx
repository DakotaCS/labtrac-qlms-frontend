import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout/Layout';
import './locationPage.css';

interface Location {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

const LocationPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend.labtrac.quantuslms.ca/api/system/location', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLocations(response.data);
    } catch (err) {
      handleError(err);
    }
  };

  const handleError = (err: any) => {
    setError(`Error: ${err.response?.status} - ${err.response?.data?.message}`);
    setTimeout(() => setError(null), 10000); // Show error popup for 10 seconds
  };

  const handleAddLocation = async (name: string, description: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/system/locations',{ name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchLocations(); // Refresh the list
      setShowAddPopup(false);
    } catch (err) {
      handleError(err);
    }
  };

  const handleUpdateLocation = async (id: number, name: string, description: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/system/locations/${id}`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchLocations(); // Refresh the list
      setShowUpdatePopup(false);
    } catch (err) {
      handleError(err);
    }
  };

  const handleDeleteLocation = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/system/locations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchLocations(); // Refresh the list
    } catch (err) {
      handleError(err);
    }
  };

  const openUpdatePopup = (location: Location) => {
    setSelectedLocation(location);
    setShowUpdatePopup(true);
  };

  return (
    <Layout>
      <div className="location-page">
        <h1 className="page-title">Inventory Item Locations</h1>
        <hr className="page-divider" />
        <button className="add-location-button" onClick={() => setShowAddPopup(true)}>
          Add Location
        </button>

        <table className="location-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(location => (
              <tr key={location.id}>
                <td>{location.id}</td>
                <td>{location.name}</td>
                <td>{location.description}</td>
                <td>{location.createdAt}</td>
                <td>
                  <button className="meatball-menu">⋮</button>
                  <div className="meatball-menu-options">
                    <button onClick={() => openUpdatePopup(location)}>Update</button>
                    <button onClick={() => handleDeleteLocation(location.id)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddPopup && (
          <div className="popup">
            <h2>Add Location</h2>
            <LocationForm
              onSubmit={(name, description) => handleAddLocation(name, description)}
              onCancel={() => setShowAddPopup(false)}
            />
          </div>
        )}

        {showUpdatePopup && selectedLocation && (
          <div className="popup">
            <h2>Update Location</h2>
            <LocationForm
              initialName={selectedLocation.name}
              initialDescription={selectedLocation.description}
              onSubmit={(name, description) =>
                handleUpdateLocation(selectedLocation.id, name, description)
              }
              onCancel={() => setShowUpdatePopup(false)}
            />
          </div>
        )}

        {error && <div className="error-popup">{error}</div>}
      </div>
    </Layout>
  );
};

interface LocationFormProps {
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  initialName = '',
  initialDescription = '',
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  return (
    <div className="location-form">
      <label>Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label>Description</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <div className="form-actions">
        <button onClick={() => onSubmit(name, description)}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default LocationPage;
