// ./src/pages/solidInventoryItemPage/inventoryItemDetailsPage/inventoryItemDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../../../config/axiosConfig';
import Layout from '../../../../components/Layout/Layout';
import ErrorPopup from '../../../../components/ErrorPopup/ErrorPopup';
import Popup from '../../../../components/Popup/Popup';
import MeatballMenu from '../../../../components/MeatballMenu/MeatballMenu';
import { useParams, useNavigate } from 'react-router-dom';
import './inventoryItemDetailsPage.css';
import { SolidInventoryItemDetails, Note } from "../../../../components/types";

const InventoryItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [itemDetails, setItemDetails] = useState<SolidInventoryItemDetails | null>(
    null
  );
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddNotePopup, setShowAddNotePopup] = useState<boolean>(false);
  const [showUpdateNotePopup, setShowUpdateNotePopup] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchItemDetails();
    fetchNotes();
  }, []);

  const fetchItemDetails = async () => {
    try {
      const response = await apiClient.get(`/inventory/solid/${id}`);
      setItemDetails(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await apiClient.get(`/inventory/note/item/${id}`);
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
      await apiClient.post('/inventory/note', {
        content,
        inventoryItemId: Number(id),
      });
      fetchNotes();
      setShowAddNotePopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateNote = async (noteId: number, content: string) => {
    try {
      await apiClient.patch(`/inventory/note/${noteId}`, { content });
      fetchNotes();
      setShowUpdateNotePopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await apiClient.delete(`/inventory/note/${noteId}`);
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
          <button className="back-button" onClick={goBack}>←</button>
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
          className="add-note-button"
          onClick={() => setShowAddNotePopup(true)}
        >Add Note</button>

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
          <Popup
            title="Update Note"
            onClose={() => setShowUpdateNotePopup(false)}
          >
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

export default InventoryItemDetailsPage;
