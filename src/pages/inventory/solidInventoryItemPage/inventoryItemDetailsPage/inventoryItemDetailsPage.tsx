/**
 * @author Dakota Soares
 * @version 1.2
 * @description
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../config/axiosConfig';
import Layout from '../../../../components/Layout/Layout';
import ErrorPopup from '../../../../components/ErrorPopup/ErrorPopup';
import Popup from '../../../../components/Popup/Popup';
import MessagePopup from '../../../../components/MessagePopup/MessagePopup';
import CustomDropdown from '../../../../components/CustomDropdown/CustomDropdown';
import MeatballMenu from '../../../../components/MeatballMenu/MeatballMenu';
import { useParams, useNavigate } from 'react-router-dom';
import {SolidInventoryItemDetails, Note, Category, Location, SolidInventoryItem } from '../../../../components/types';
import './inventoryItemDetailsPage.css';

const InventoryItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [itemDetails, setItemDetails] = useState<SolidInventoryItemDetails | null>(
    null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showAddNotePopup, setShowAddNotePopup] = useState<boolean>(false);
  const [showUpdateNotePopup, setShowUpdateNotePopup] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditDetailsPopup, setShowEditDetailsPopup] = useState<boolean>(false);
  const [showEditQuantityPopup, setShowEditQuantityPopup] = useState<boolean>(false);
  const [showUpdateNotificationsPopup, setShowUpdateNotificationsPopup] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const fetchItemDetails = useCallback(async () => {
    try {
      const response = await apiClient.get(`/inventory/solid/${id}`);
      setItemDetails(response.data);
    } catch (err: any) {
      setError('Error: Could not retrieve the Item Details');
    }
  }, [id]);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await apiClient.get(`/inventory/note/item/${id}`);
      setNotes(response.data);
    } catch (err: any) {
      setError('Error: Could not retrieve the Notes List');
    }
  }, [id]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [categoriesResponse, locationsResponse] = await Promise.all([
        apiClient.get('/system/category'),
        apiClient.get('/system/location'),
      ]);
      setCategories(categoriesResponse.data);
      setLocations(locationsResponse.data);
    } catch (err) {
      setError('Error: Could not retrieve metadata');
    }
  }, []);

  useEffect(() => {
    fetchItemDetails();
    fetchNotes();
    fetchMetadata();
  }, [fetchItemDetails, fetchNotes, fetchMetadata]);

  const handleUpdateDetails = async (data: any) => {
    try {
      await apiClient.patch(`/inventory/solid/${id}`, data);
      fetchItemDetails();
      setShowEditDetailsPopup(false);
      setMessage('Message: The item details were updated successfully');
    } catch (err) {
      setError('Error: Could not update item details');
    }
  };

  const handleUpdateQuantity = async (quantityUsed: number) => {
    try {
      await apiClient.patch(`/inventory/solid/${id}/quantity`, { quantityUsed });
      fetchItemDetails();
      setShowEditQuantityPopup(false);
      setMessage('Message: The quantity was updated successfully');
    } catch (err) {
      setError('Error: Could not update quantity');
    }
  };

  const handleAddNote = async (content: string) => {
    try {
      await apiClient.post('/inventory/note', {
        content,
        inventoryItemId: Number(id),
      });
      fetchNotes();
      setShowAddNotePopup(false);
      setMessage('Message: The note was added successfully');
    } catch (err: any) {
      setError('Error: The note could not be added');
    }
  };

  const handleUpdateNote = async (noteId: number, content: string) => {
    try {
      await apiClient.patch(`/inventory/note/${noteId}`, { content });
      fetchNotes();
      setShowUpdateNotePopup(false);
      setMessage('Message: The note was updated successfully');
    } catch (err: any) {
      setError('Error: The note could not be updated');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await apiClient.delete(`/inventory/note/${noteId}`);
      fetchNotes();
      setMessage('Message: The note was deleted successfully');
    } catch (err: any) {
      setError('Error: The note could not be deleted');
    }
  };

  const handleUpdateNotifications = async (settings: any) => {
    try {
      await apiClient.patch(`/inventory/notification/item/${id}`, settings);
      fetchItemDetails();
      setShowUpdateNotificationsPopup(false);
      setMessage('Message: Notifications updated successfully');
    } catch (err: any) {
      setError('Error: Could not update notifications');
    }
  };

  const openUpdateNotePopup = (note: Note) => {
    setSelectedNote(note);
    setShowUpdateNotePopup(true);
  };

  const navigate = useNavigate();

  const goBack = () => {
    navigate('/inventory/solid');
  };

  return (
    <Layout>
      <div className="inventory-item-details-page">
        <div className="header-row">
          <button className="back-button" onClick={goBack}>
            ←
          </button>
          <h1 className="page-title">Inventory Item Details</h1>
        </div>
        <hr className="page-divider" />
        <div className="button-container">
          <button className="edit-button" onClick={() => setShowEditDetailsPopup(true)}>
            Edit Item Details
          </button>
          <button className="edit-button" onClick={() => setShowEditQuantityPopup(true)}>
            Edit Quantity
          </button>
          <button
            className="edit-button" onClick={() => setShowUpdateNotificationsPopup(true)}>
            Update Notifications
          </button>
        </div>

        {showEditDetailsPopup && itemDetails && (
          <Popup title="Edit Item Details" onClose={() => setShowEditDetailsPopup(false)}>
            <UpdateDetailsForm
              item={itemDetails}
              locations={locations}
              categories={categories}
              onSubmit={handleUpdateDetails}
              onCancel={() => setShowEditDetailsPopup(false)}
            />
          </Popup>
        )}

        {showEditQuantityPopup && (
          <Popup title="Edit Quantity" onClose={() => setShowEditQuantityPopup(false)}>
            <UpdateQuantityForm
              onSubmit={handleUpdateQuantity}
              onCancel={() => setShowEditQuantityPopup(false)}
            />
          </Popup>
        )}

        {showUpdateNotificationsPopup && itemDetails && (
          <Popup
            title="Update Notifications"
            onClose={() => setShowUpdateNotificationsPopup(false)}
          >
            <UpdateNotificationsForm
              initialSettings={
                itemDetails.inventoryItemNotification || { lowQuantityAlarm: false }
              }
              onSubmit={handleUpdateNotifications}
              onCancel={() => setShowUpdateNotificationsPopup(false)}
            />
          </Popup>
        )}

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}
        {message && <MessagePopup message={message} onClose={() => setMessage(null)} />}

        {itemDetails && (
          <div className="item-details">
            <p><strong>Inventory Item ID:</strong> {itemDetails.inventoryItemId}</p>
            <p><strong>Name:</strong> {itemDetails.name}</p>
            <p><strong>Import Date:</strong> {itemDetails.importDate}</p>
            <p><strong>Status:</strong> {itemDetails.status}</p>
            <p><strong>Location ID:</strong> {itemDetails.location.locationId}</p>
            <p><strong>Location Name:</strong> {itemDetails.location.name}</p>
            <p><strong>Category ID:</strong> {itemDetails.category.categoryId}</p>
            <p><strong>Category Name:</strong> {itemDetails.category.name}</p>
            <p><strong>Expiration Date:</strong> {itemDetails.expirationDate}</p>
            <p><strong>CAS Number:</strong> {itemDetails.casNumber}</p>
            <p><strong>Current Quantity:</strong> {itemDetails.currentQuantityAmount}</p>
            <p><strong>Original Quantity:</strong> {itemDetails.originalQuantityAmount}</p>
            <p><strong>Quantity Unit:</strong> {itemDetails.quantityUnit}</p>
          </div>
        )}

        <button
            className="note-and-notification-button" onClick={() => setShowUpdateNotificationsPopup(true)}>
            Update Notifications
          </button>

        {itemDetails && itemDetails.inventoryItemNotification && (
          <div className="notification-settings">

            <table className="notification-table">
              <thead>
                <tr>
                  <th>Notification Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Low Quantity Alarm</td>
                  <td>
                    {itemDetails.inventoryItemNotification.lowQuantityAlarm
                      ? 'Enabled'
                      : 'Disabled'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <button className="note-and-notification-button" onClick={() => setShowAddNotePopup(true)}>
          Add Note
        </button>

        <table className="notes-table">
          <thead>
            <tr>
              <th>Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id}>
                <td>{note.content}</td>
                <td>
                  <MeatballMenu
                    options={[
                      {
                        label: 'Update Note',
                        onClick: () => openUpdateNotePopup(note),
                      },
                      {
                        label: 'Delete Note',
                        onClick: () => handleDeleteNote(note.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddNotePopup && (
          <Popup title="Add Note" onClose={() => setShowAddNotePopup(false)}>
            <NoteForm
              onSubmit={handleAddNote}
              onCancel={() => setShowAddNotePopup(false)}
            />
          </Popup>
        )}

        {showUpdateNotePopup && selectedNote && (
          <Popup title="Update Note" onClose={() => setShowUpdateNotePopup(false)}>
            <NoteForm
              initialContent={selectedNote.content}
              onSubmit={(content) => handleUpdateNote(selectedNote.id, content)}
              onCancel={() => setShowUpdateNotePopup(false)}
            />
          </Popup>
        )}
      </div>
    </Layout>
  );
};

interface NoteFormProps {
  initialContent?: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({
  initialContent = '',
  onSubmit,
  onCancel,
}) => {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="note-form">
      <label>Content</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={5}
      />
      <div className="form-actions">
        <button onClick={() => onSubmit(content)}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

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
      <input type="text" value={casNumber} onChange={(e) => setCasNumber(e.target.value)} />

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

interface UpdateNotificationsFormProps {
  initialSettings: { lowQuantityAlarm: boolean };
  onSubmit: (settings: { lowQuantityAlarm: boolean }) => void;
  onCancel: () => void;
}

const UpdateNotificationsForm: React.FC<UpdateNotificationsFormProps> = ({
  initialSettings,
  onSubmit,
  onCancel,
}) => {
  const [lowQuantityAlarm, setLowQuantityAlarm] = useState<boolean>(
    initialSettings.lowQuantityAlarm
  );

  return (
    <div className="update-notifications-form">
      <label>
        <input
          type="checkbox"
          checked={lowQuantityAlarm}
          onChange={(e) => setLowQuantityAlarm(e.target.checked)}
        />
        Low Quantity Alarm
      </label>
      <div className="form-actions">
        <button onClick={() => onSubmit({ lowQuantityAlarm })}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default InventoryItemDetailsPage;