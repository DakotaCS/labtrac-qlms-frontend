// ./src/pages/locationPage/locationPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig'; // Import the configured Axios instance
import Layout from '../../components/Layout/Layout';
import ErrorPopup from '../../components/ErrorPopup/ErrorPopup';
import Popup from '../../components/Popup/Popup';
import MeatballMenu from '../../components/MeatballMenu/MeatballMenu';
import SearchBarWithFilter from '../../components/SearchBarWithFilter/SearchBarWithFilter';
import './locationPage.css';

interface Location {
  id: number;
  locationId: string;
  name: string;
  description: string;
  createTime: string;
}

const LocationPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuCollapsed] = useState(false);

  const columns = ['Location ID', 'Name', 'Description', 'Date Created'];

  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState(columns[0]); // Default to 'Location ID'

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = locations.filter((item) => {
      const field = searchColumnToField(searchColumn);
      const value = item[field];
      if (value) {
        return value.toString().toLowerCase().includes(lowercasedFilter);
      }
      return false;
    });
    setFilteredLocations(filteredData);
  }, [locations, searchTerm, searchColumn]);

  const searchColumnToField = (column: string): keyof Location => {
    const columnMap: { [key: string]: keyof Location } = {
      'Location ID': 'locationId',
      Name: 'name',
      Description: 'description',
      'Date Created': 'createTime',
    };
    return columnMap[column];
  };

  const fetchLocations = async () => {
    try {
      const response = await apiClient.get('/system/location');
      console.log('API Response Data:', response.data);
      setLocations(response.data);
      setFilteredLocations(response.data);
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

  const handleAddLocation = async (name: string, description: string) => {
    try {
      await apiClient.post('/system/location', { name, description });
      fetchLocations();
      setShowAddPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateLocation = async (
    id: number,
    name: string,
    description: string
  ) => {
    try {
      await apiClient.patch(`/system/location/${id}`, { name, description });
      fetchLocations();
      setShowUpdatePopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleDeleteLocation = async (id: number) => {
    try {
      await apiClient.delete(`/system/location/${id}`);
      fetchLocations();
    } catch (err: any) {
      handleError(err);
    }
  };

  const openUpdatePopup = (location: Location) => {
    setSelectedLocation(location);
    setShowUpdatePopup(true);
  };

  return (
    <Layout>
      <div className={`location-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">Inventory Item Locations</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}

        <div className="button-container">
          <div className="button-group">
            <button
              className="add-location-button"
              onClick={() => setShowAddPopup(true)}
            >
              Add Location
            </button>
            <SearchBarWithFilter
              columns={columns}
              onSearch={(term) => setSearchTerm(term)}
              onFilterChange={(filter) => setSearchColumn(filter)}
            />
          </div>
        </div>

        <table className="location-table">
          <thead>
            <tr>
              <th>Location ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Date Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.map((location) => (
              <tr key={location.id}>
                <td>{location.locationId}</td>
                <td>{location.name}</td>
                <td>{location.description}</td>
                <td>{location.createTime}</td>
                <td>
                  <MeatballMenu
                    options={[
                      {
                        label: 'Update',
                        onClick: () => openUpdatePopup(location),
                      },
                      {
                        label: 'Remove',
                        onClick: () => handleDeleteLocation(location.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddPopup && (
          <Popup title="Add Location" onClose={() => setShowAddPopup(false)}>
            <LocationForm
              onSubmit={(name, description) =>
                handleAddLocation(name, description)
              }
              onCancel={() => setShowAddPopup(false)}
            />
          </Popup>
        )}

        {showUpdatePopup && selectedLocation && (
          <Popup
            title="Update Location"
            onClose={() => setShowUpdatePopup(false)}
          >
            <LocationForm
              initialName={selectedLocation.name}
              initialDescription={selectedLocation.description}
              onSubmit={(name, description) =>
                handleUpdateLocation(selectedLocation.id, name, description)
              }
              onCancel={() => setShowUpdatePopup(false)}
            />
          </Popup>
        )}
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
