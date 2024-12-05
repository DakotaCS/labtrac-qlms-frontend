/**
 * @author Dakota Soares
 * @version 1.1
 * @description Category Management Page
 */

import React, { useState, useEffect , useCallback } from 'react';
import apiClient from '../../../config/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import ErrorPopup from '../../../components/ErrorPopup/ErrorPopup';
import MessagePopup from '../../../components/MessagePopup/MessagePopup';
import Popup from '../../../components/Popup/Popup';
import MeatballMenu from '../../../components/MeatballMenu/MeatballMenu';
import SearchBarWithFilter from '../../../components/SearchBarWithFilter/SearchBarWithFilter';
import { Category } from '../../../components/types';
import './categoryPage.css';

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [menuCollapsed] = useState(false);
  const columns = ['Category ID', 'Name', 'Description', 'Date Created'];
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState(columns[0]); // Defaults to 'Category ID'

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/system/category');
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (err: any) {
      setError('Error: Could not retrieve the Category List');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = categories.filter((item) => {
      const field = searchColumnToField(searchColumn);
      const value = item[field];
      if (value) {
        return value.toString().toLowerCase().includes(lowercasedFilter);
      }
      return false;
    });
    setFilteredCategories(filteredData);
  }, [categories, searchTerm, searchColumn]);

  const searchColumnToField = (column: string): keyof Category => {
    const columnMap: { [key: string]: keyof Category } = {
      'Category ID': 'categoryId',
      Name: 'name',
      Description: 'description',
      'Date Created': 'createTime',
    };
    return columnMap[column];
  };

  const handleAddCategory = async (name: string, description: string) => {
    try {
      await apiClient.post('/system/category', { name, description });
      fetchCategories();
      setShowAddPopup(false);
      setMessage('Message: The category was added successfully');
    } catch (err: any) {
      setError('Error: The category could not be added');
    }
  };

  const handleUpdateCategory = async (
    id: number,
    name: string,
    description: string
  ) => {
    try {
      await apiClient.patch(`/system/category/${id}`, { name, description });
      fetchCategories();
      setShowUpdatePopup(false);
      setMessage('Message: The category was updated successfully');
    } catch (err: any) {
      setError('Error: The category could not be updated');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiClient.delete(`/system/category/${id}`);
      fetchCategories();
      setMessage('Message: The category was deleted successfully');
    } catch (err: any) {
      setError('Error: The category could not be deleted');
    }
  };

  const openUpdatePopup = (category: Category) => {
    setSelectedCategory(category);
    setShowUpdatePopup(true);
  };

  return (
    <Layout>
      <div className={`category-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">Inventory Item Categories</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}
        {message && <MessagePopup message={message} onClose={() => setMessage(null)} />}

        <div className="button-container">
            <button className="add-category-button" onClick={() => setShowAddPopup(true)}>Add Category</button>
            <SearchBarWithFilter
              columns={columns}
              onSearch={(term) => setSearchTerm(term)}
              onFilterChange={(filter) => setSearchColumn(filter)}
            />
        </div>

        <table className="category-table">
          <thead>
            <tr>
              <th>Category ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Date Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td>{category.categoryId}</td>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>{category.createTime}</td>
                <td>
                  <MeatballMenu
                    options={[
                      {
                        label: 'Update',
                        onClick: () => openUpdatePopup(category),
                      },
                      {
                        label: 'Remove',
                        onClick: () => handleDeleteCategory(category.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddPopup && (
          <Popup title="Add Category" onClose={() => setShowAddPopup(false)}>
            <CategoryForm
              onSubmit={(name, description) =>
                handleAddCategory(name, description)
              }
              onCancel={() => setShowAddPopup(false)}
            />
          </Popup>
        )}

        {showUpdatePopup && selectedCategory && (
          <Popup
            title="Update Category"
            onClose={() => setShowUpdatePopup(false)}
          >
            <CategoryForm
              initialName={selectedCategory.name}
              initialDescription={selectedCategory.description}
              onSubmit={(name, description) =>
                handleUpdateCategory(selectedCategory.id, name, description)
              }
              onCancel={() => setShowUpdatePopup(false)}
            />
          </Popup>
        )}
      </div>
    </Layout>
  );
};

interface CategoryFormProps {
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialName = '',
  initialDescription = '',
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  return (
    <div className="category-form">
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

export default CategoryPage;
