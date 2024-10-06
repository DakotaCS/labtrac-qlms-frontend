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
  const [showDialog, setShowDialog] = useState<string | null>(null); // For different popup dialogs
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newValue, setNewValue] = useState<string>(''); // For input values in dialogs
  const [error, setError] = useState<string | null>(null);
  const [menuCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // State for adding a new user
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('ADMIN'); // Default to Admin

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

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://backend.labtrac.quantuslms.ca/api/system/user',
        {
          userName: newUsername,
          password: newPassword,
          role: newRole.toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
      setShowDialog(null); // Close the dialog
      setNewUsername('');
      setNewPassword('');
      setNewRole('ADMIN'); // Reset to default
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleUpdateUser = async (url: string, body: object) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
      setShowDialog(null); // Close the dialog
    } catch (err: any) {
      handleError(err);
    }
  };

  const openDialog = (type: string, user: User) => {
    setSelectedUser(user);
    if (type === 'status') {
      setNewValue(user.isDisabled ? 'disable' : 'enable');
    } else {
      setNewValue(''); // Reset input for other dialogs
    }
    setShowDialog(type); // Set the type of dialog
  };

  const toggleMenu = (userId: number) => {
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  // Convert role from uppercase to camel-case
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const handleSubmit = () => {
    if (!selectedUser) return;

    switch (showDialog) {
      case 'username':
        handleUpdateUser(`https://backend.labtrac.quantuslms.ca/api/system/user/${selectedUser.id}/username`, { userName: newValue });
        break;
      case 'password':
        handleUpdateUser(`https://backend.labtrac.quantuslms.ca/api/system/user/${selectedUser.id}/password`, { password: newValue });
        break;
      case 'role':
        handleUpdateUser(`https://backend.labtrac.quantuslms.ca/api/system/user/${selectedUser.id}/user-role`, { role: newValue.toUpperCase() });
        break;
      case 'status':
        // Send the selected status directly to the backend (either 'enable' or 'disable')
        handleUpdateUser(`https://backend.labtrac.quantuslms.ca/api/system/user/${selectedUser.id}/status`, { userStatus: newValue });
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

        <button className="add-user-button" onClick={() => setShowDialog('add-user')}>
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
                <td className="meatball-menu-container">
                  <button className="meatball-menu" onClick={() => toggleMenu(user.id)}>⋮</button>
                  {activeMenu === user.id && (
                    <div className="meatball-menu-options" ref={menuRef}>
                      <button className="menu-option" onClick={() => openDialog('username', user)}>Update Username</button>
                      <button className="menu-option" onClick={() => openDialog('password', user)}>Update Password</button>
                      <button className="menu-option" onClick={() => openDialog('role', user)}>Update Role</button>
                      <button className="menu-option" onClick={() => openDialog('status', user)}>Update Status</button>
                      <button className="menu-option" onClick={() => handleUpdateUser(`https://backend.labtrac.quantuslms.ca/api/system/user/${user.id}`, {})}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add User Popup */}
        {showDialog === 'add-user' && (
          <div className="popup">
            <h2>Add User</h2>
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
          </div>
        )}

        {/* Update User Popups */}
        {showDialog && showDialog !== 'add-user' && (
          <div className="popup">
            <h2>
              {showDialog === 'username' && 'Update Username'}
              {showDialog === 'password' && 'Update Password'}
              {showDialog === 'role' && 'Update Role'}
              {showDialog === 'status' && 'Update Status'}
            </h2>
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
                  <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
                    <option value="ADMIN">Admin</option>
                    <option value="TECH">Tech</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </>
              )}
              {showDialog === 'status' && (
                <>
                  <label>Status</label>
                  <select value={newValue} onChange={(e) => setNewValue(e.target.value)}>
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserManagementPage;
