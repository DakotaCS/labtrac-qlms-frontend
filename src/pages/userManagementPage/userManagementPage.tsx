// ./src/pages/UserManagementPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig'; // Import the configured Axios instance
import Layout from '../../components/Layout/Layout';
import ErrorPopup from '../../components/ErrorPopup/ErrorPopup';
import Popup from '../../components/Popup/Popup';
import MeatballMenu from '../../components/MeatballMenu/MeatballMenu';
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
  const [showDialog, setShowDialog] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newValue, setNewValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [menuCollapsed] = useState(false);

  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('ADMIN');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/system/user');
      setUsers(response.data);
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

  const handleAddUser = async () => {
    try {
      await apiClient.post('/system/user', {
        userName: newUsername,
        password: newPassword,
        role: newRole.toUpperCase(),
      });
      fetchUsers();
      setShowDialog(null);
      setNewUsername('');
      setNewPassword('');
      setNewRole('ADMIN');
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateUser = async (url: string, body: object) => {
    try {
      await apiClient.patch(url, body);
      fetchUsers();
      setShowDialog(null);
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await apiClient.delete(`/system/user/${userId}`);
      fetchUsers();
    } catch (err: any) {
      handleError(err);
    }
  };

  const openDialog = (type: string, user: User) => {
    setSelectedUser(user);
    if (type === 'status') {
      setNewValue(user.isDisabled ? 'enable' : 'disable');
    } else {
      setNewValue('');
    }
    setShowDialog(type);
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const handleSubmit = () => {
    if (!selectedUser) return;

    switch (showDialog) {
      case 'username':
        handleUpdateUser(`/system/user/${selectedUser.id}/username`, {
          userName: newValue,
        });
        break;
      case 'password':
        handleUpdateUser(`/system/user/${selectedUser.id}/password`, {
          password: newValue,
        });
        break;
      case 'role':
        handleUpdateUser(`/system/user/${selectedUser.id}/user-role`, {
          role: newValue.toUpperCase(),
        });
        break;
      case 'status':
        handleUpdateUser(`/system/user/${selectedUser.id}/status`, {
          userStatus: newValue,
        });
        break;
      default:
        break;
    }
  };

  return (
    <Layout>
      <div className={`user-page ${menuCollapsed ? 'collapsed' : ''}`}>
        <h1 className="page-title">User Management</h1>
        <hr className="page-divider" />

        {error && <ErrorPopup error={error} onClose={() => setError(null)} />}

        <button
          className="add-user-button"
          onClick={() => setShowDialog('add-user')}
        >
          Add User
        </button>

        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Date Created</th>
              <th>Status</th>
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
                <td>{user.isDisabled ? 'Disabled' : 'Enabled'}</td>
                <td>{formatRole(user.userRole)}</td>
                <td>
                  <MeatballMenu
                    options={[
                      {
                        label: 'Update Username',
                        onClick: () => openDialog('username', user),
                      },
                      {
                        label: 'Update Password',
                        onClick: () => openDialog('password', user),
                      },
                      {
                        label: 'Update Role',
                        onClick: () => openDialog('role', user),
                      },
                      {
                        label: 'Update Status',
                        onClick: () => openDialog('status', user),
                      },
                      {
                        label: 'Delete',
                        onClick: () => handleDeleteUser(user.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add User Popup */}
        {showDialog === 'add-user' && (
          <Popup title="Add User" onClose={() => setShowDialog(null)}>
            <div className="user-form">
              <label>Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
              <label>Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <label>Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="ADMIN">Admin</option>
                <option value="TECH">Tech</option>
                <option value="MANAGER">Manager</option>
              </select>
              <div className="form-actions">
                <button onClick={handleAddUser}>Submit</button>
                <button onClick={() => setShowDialog(null)}>Cancel</button>
              </div>
            </div>
          </Popup>
        )}

        {/* Update User Popups */}
        {showDialog && showDialog !== 'add-user' && (
          <Popup
            title={
              showDialog === 'username'
                ? 'Update Username'
                : showDialog === 'password'
                ? 'Update Password'
                : showDialog === 'role'
                ? 'Update Role'
                : 'Update Status'
            }
            onClose={() => setShowDialog(null)}
          >
            <div className="user-form">
              {showDialog === 'username' && (
                <>
                  <label>Username</label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={selectedUser?.userName}
                    required
                  />
                </>
              )}
              {showDialog === 'password' && (
                <>
                  <p>The new password must not be less than 8 characters.</p>
                  <label>Password</label>
                  <input
                    type="password"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    required
                  />
                </>
              )}
              {showDialog === 'role' && (
                <>
                  <label>Role</label>
                  <select
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TECH">Tech</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </>
              )}
              {showDialog === 'status' && (
                <>
                  <label>Status</label>
                  <select
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  >
                    <option value="enable">Enable</option>
                    <option value="disable">Disable</option>
                  </select>
                </>
              )}
              <div className="form-actions">
                <button onClick={handleSubmit}>Submit</button>
                <button onClick={() => setShowDialog(null)}>Cancel</button>
              </div>
            </div>
          </Popup>
        )}
      </div>
    </Layout>
  );
};

export default UserManagementPage;
