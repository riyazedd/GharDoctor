import { useState, useEffect } from 'react'
import './Dashboard.css'

function Dashboard({ onLogout }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [userId, setUserId] = useState('')
  const [editUserId, setEditUserId] = useState('')
  const [editForm, setEditForm] = useState({})
  const [activeTab, setActiveTab] = useState('list-users')

  const token = localStorage.getItem('token')

  const fetchAllUsers = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setUsers(data)
        setMessageType('success')
        setMessage('Users fetched successfully!')
      } else {
        setMessageType('error')
        setMessage(data.message || 'Failed to fetch users')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserById = async (id) => {
    if (!id) {
      setMessageType('error')
      setMessage('Please enter a user ID')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setUsers([data])
        setMessageType('success')
        setMessage('User fetched successfully!')
      } else {
        setMessageType('error')
        setMessage(data.message || 'User not found')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const startEdit = (user) => {
    setEditUserId(user._id)
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address
    })
  }

  const updateUser = async () => {
    if (!editUserId) {
      setMessageType('error')
      setMessage('No user selected for edit')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`http://localhost:3000/api/users/${editUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessageType('success')
        setMessage('User updated successfully!')
        setEditUserId('')
        setEditForm({})
        fetchAllUsers()
      } else {
        setMessageType('error')
        setMessage(data.message || 'Failed to update user')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        setMessageType('success')
        setMessage('User deleted successfully!')
        fetchAllUsers()
      } else {
        const data = await response.json()
        setMessageType('error')
        setMessage(data.message || 'Failed to delete user')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>GharDoctor - API Testing Dashboard</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'list-users' ? 'active' : ''}`}
          onClick={() => setActiveTab('list-users')}
        >
          List All Users
        </button>
        <button 
          className={`tab ${activeTab === 'get-user' ? 'active' : ''}`}
          onClick={() => setActiveTab('get-user')}
        >
          Get User by ID
        </button>
        <button 
          className={`tab ${activeTab === 'edit-user' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit-user')}
        >
          Edit User
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {activeTab === 'list-users' && (
        <div className="tab-content">
          <button onClick={fetchAllUsers} disabled={loading} className="action-btn">
            {loading ? 'Loading...' : 'Fetch All Users'}
          </button>

          <div className="users-list">
            {users.length > 0 ? (
              users.map(user => (
                <div key={user._id} className="user-card">
                  <h3>{user.firstName} {user.lastName}</h3>
                  <p><strong>ID:</strong> {user._id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phone}</p>
                  <p><strong>Address:</strong> {user.address}</p>
                  <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
                  <div className="user-actions">
                    <button onClick={() => {setActiveTab('edit-user'); startEdit(user)}} className="edit-btn">Edit</button>
                    <button onClick={() => deleteUser(user._id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No users found</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'get-user' && (
        <div className="tab-content">
          <div className="form-group">
            <label>User ID:</label>
            <input 
              type="text" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
          </div>
          <button onClick={() => fetchUserById(userId)} disabled={loading} className="action-btn">
            {loading ? 'Loading...' : 'Fetch User'}
          </button>

          <div className="users-list">
            {users.length > 0 ? (
              users.map(user => (
                <div key={user._id} className="user-card">
                  <h3>{user.firstName} {user.lastName}</h3>
                  <p><strong>ID:</strong> {user._id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phone}</p>
                  <p><strong>Address:</strong> {user.address}</p>
                  <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
                  <div className="user-actions">
                    <button onClick={() => {setActiveTab('edit-user'); startEdit(user)}} className="edit-btn">Edit</button>
                    <button onClick={() => deleteUser(user._id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No user found</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'edit-user' && (
        <div className="tab-content">
          {editUserId ? (
            <div className="edit-form">
              <h3>Edit User: {editUserId}</h3>
              <div className="form-group">
                <label>First Name:</label>
                <input 
                  type="text" 
                  value={editForm.firstName || ''}
                  onChange={(e) => handleEditChange('firstName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input 
                  type="text" 
                  value={editForm.lastName || ''}
                  onChange={(e) => handleEditChange('lastName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={editForm.email || ''}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input 
                  type="text" 
                  value={editForm.phone || ''}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input 
                  type="text" 
                  value={editForm.address || ''}
                  onChange={(e) => handleEditChange('address', e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button onClick={updateUser} disabled={loading} className="action-btn">
                  {loading ? 'Updating...' : 'Update User'}
                </button>
                <button onClick={() => setEditUserId('')} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <p>Select a user to edit from the List All Users or Get User by ID tabs</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
