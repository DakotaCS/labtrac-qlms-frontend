// ./src/pages/CategoryPage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout/Layout';
import ErrorPopup from '../../components/ErrorPopup/ErrorPopup';
import Popup from '../../components/Popup/Popup';
import MeatballMenu from '../../components/MeatballMenu/MeatballMenu';
import './categoryPage.css';

interface Category {
  id: number;
  categoryId: string;
  name: string;
  description: string;
  createTime: string;
}

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuCollapsed] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://backend.labtrac.quantuslms.ca/api/system/category',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data);
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

  const handleAddCategory = async (name: string, description: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://backend.labtrac.quantuslms.ca/api/system/category',
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCategories();
      setShowAddPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateCategory = async (
    id: number,
    name: string,
    description: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://backend.labtrac.quantuslms.ca/api/system/category/${id}`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCategories();
      setShowUpdatePopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://backend.labtrac.quantuslms.ca/api/system/category/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCategories();
    } catch (err: any) {
      handleError(err);
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

        <button
          className="add-category-button"
          onClick={() => setShowAddPopup(true)}
        >
          Add Category
        </button>

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
            {categories.map((category) => (
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
