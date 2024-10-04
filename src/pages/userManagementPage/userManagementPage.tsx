import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout/Layout';
import ErrorPopup from '../../components/ErrorPopup/ErrorPopup';
import './userManagementPage.css';

interface User {
  id: number;
  userName: string;
  isDisabled: boolean;
  userRole: string;
  createTime: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend.labtrac.quantuslms.ca/api/system/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleError = (err: any) => {
    const errorMessage = `Error: ${err.response?.status} - ${err.response?.data?.message || err.message}`;
    setError(errorMessage);
  };

  const handleAddUser = async (userName: string, password: string, role: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://backend.labtrac.quantuslms.ca/api/system/user',
        { userName, password, role: role.toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
      setShowAddPopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateUserName = async (userId: number, userName: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://backend.labtrac.quantuslms.ca/api/system/${userId}/username`,
        { userName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
      setShowUpdatePopup(false);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdatePassword = async (userId: number, password: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://backend.labtrac.quantuslms.ca/api/system/${userId}/password`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://backend.labtrac.quantuslms.ca/api/system/${userId}/menu-role`,
        { role: role.toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateStatus = async (userId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://backend.labtrac.quantuslms.ca/api/system/${userId}/status`,
        { userStatus: status.toLowerCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const currentUserId = parseInt(localStorage.getItem('userId') || '0', 10);
      if (userId === currentUserId) {
        throw new Error("You cannot delete your own account");
      }
      await axios.delete(`https://backend.labtrac.quantuslms.ca/api/system/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (err: any) {
      handleError(err);
    }
  };

  const openUpdatePopup = (user: User) => {
    setSelectedUser(user);
    setShowUpdatePopup(true);
  };

  const toggleMenu = (userId: number) => {
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  return (
    <Layout>
      <div className={`user-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">User Management</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}

        <button className="add-user-button" onClick={() => setShowAddPopup(true)}>
          Add User
        </button>

        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Date Created</th>
              <th>Is Disabled</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.userName}</td>
                <td>{user.createTime}</td>
                <td>{user.isDisabled ? 'Yes' : 'No'}</td>
                <td>{user.userRole}</td>
                <td className="meatball-menu-container">
                  <button className="meatball-menu" onClick={() => toggleMenu(user.id)}>⋮</button>
                  {activeMenu === user.id && (
                    <div className="meatball-menu-options" ref={menuRef}>
                      <button className="menu-option" onClick={() => openUpdatePopup(user)}>Change Username</button>
                      <button className="menu-option" onClick={() => handleUpdatePassword(user.id, 'NewPassword')}>Change Password</button>
                      <button className="menu-option" onClick={() => handleUpdateRole(user.id, 'TECH')}>Change Role</button>
                      <button className="menu-option" onClick={() => handleUpdateStatus(user.id, 'enable')}>Change Status</button>
                      <button className="menu-option" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddPopup && (
          <div className="popup">
            <h2>Add User</h2>
            <UserForm onSubmit={(userName, password, role) => handleAddUser(userName, password, role)} onCancel={() => setShowAddPopup(false)} />
          </div>
        )}

        {showUpdatePopup && selectedUser && (
          <div className="popup">
            <h2>Update User</h2>
            <UserForm
              initialUserName={selectedUser.userName}
              initialRole={selectedUser.userRole}
              onSubmit={(userName, password, role) => {
                handleUpdateUserName(selectedUser.id, userName);
                handleUpdateRole(selectedUser.id, role);
              }}
              onCancel={() => setShowUpdatePopup(false)}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

interface UserFormProps {
  initialUserName?: string;
  initialRole?: string;
  onSubmit: (userName: string, password: string, role: string) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialUserName = '', initialRole = '', onSubmit, onCancel }) => {
  const [userName, setUserName] = useState(initialUserName);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);

  return (
    <div className="user-form">
      <label>Username</label>
      <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
      <label>Password</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <label>Role</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="ADMIN">Admin</option>
        <option value="TECH">Tech</option>
        <option value="MANAGER">Manager</option>
      </select>
      <div className="form-actions">
        <button onClick={() => onSubmit(userName, password, role)}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default UserManagementPage;
