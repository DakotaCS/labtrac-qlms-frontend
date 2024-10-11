// ./src/pages/InventoryItemDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import Popup from '../../../components/Popup/Popup';
import MeatballMenu from '../../../components/MeatballMenu/MeatballMenu';
import { useParams, useNavigate } from 'react-router-dom';
import './inventoryItemDetailsPage.css';

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

interface SolidInventoryItemDetails {
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
}

interface Note {
  id: number;
  inventoryItemId: number;
  content: string;
}

const InventoryItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [itemDetails, setItemDetails] = useState<SolidInventoryItemDetails | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddNotePopup, setShowAddNotePopup] = useState<boolean>(false);
  const [showUpdateNotePopup, setShowUpdateNotePopup] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchItemDetails();
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItemDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://backend.labtrac.quantuslms.ca/api/inventory/solid/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setItemDetails(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://backend.labtrac.quantuslms.ca/api/inventory/note/item/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotes(response.data);
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

  const handleAddNote = async (content: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://backend.labtrac.quantuslms.ca/api/inventory/note',
        {
          content,
          inventoryItemId: Number(id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotes();
      setShowAddNotePopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateNote = async (noteId: number, content: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://backend.labtrac.quantuslms.ca/api/inventory/note/${noteId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotes();
      setShowUpdateNotePopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://backend.labtrac.quantuslms.ca/api/inventory/note/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotes();
    } catch (err: any) {
      handleError(err);
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
  
        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}
  
        {itemDetails && (
          <div className="item-details">
            <p><strong>Inventory Item ID:</strong> {itemDetails.inventoryItemId}</p>
            <p><strong>Name:</strong> {itemDetails.name}</p>
            <p><strong>Import Date:</strong> {itemDetails.importDate}</p>
            <p><strong>Status:</strong> {itemDetails.status}</p>
            <p><strong>Location ID:</strong> {itemDetails.location.id}</p>
            <p><strong>Location Name:</strong> {itemDetails.location.name}</p>
            <p><strong>Category ID:</strong> {itemDetails.category.id}</p>
            <p><strong>Category Name:</strong> {itemDetails.category.name}</p>
            <p><strong>Expiration Date:</strong> {itemDetails.expirationDate}</p>
            <p><strong>CAS Number:</strong> {itemDetails.casNumber}</p>
            <p><strong>Current Quantity:</strong> {itemDetails.currentQuantityAmount}</p>
            <p><strong>Original Quantity:</strong> {itemDetails.originalQuantityAmount}</p>
            <p><strong>Quantity Unit:</strong> {itemDetails.quantityUnit}</p>
          </div>
        )}
  
        <button className="add-note-button" onClick={() => setShowAddNotePopup(true)}>
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

// NoteForm Component
interface NoteFormProps {
  initialContent?: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ initialContent = '', onSubmit, onCancel }) => {
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

export default InventoryItemDetailsPage;
