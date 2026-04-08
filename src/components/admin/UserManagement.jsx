import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { userService } from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    firstname: '',
    lastname: '',
    emailId: '',
    password: '',
    mobileNo: '',
    status: 'A',
    roleId: '',
    companyId: '',
    plantId: '',
    departmentId: '',
    deptId: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);


const fetchInitialData = async () => {
  setIsLoading(true);
  try {
    const [usersData, companiesData, plantsData, rolesData] = await Promise.all([
      adminService.getUsers(),
      adminService.getCompanies(),
      adminService.getPlants(),
      adminService.getRoles(), // fetch roles
    ]);

    setCompanies(companiesData);
    setPlants(plantsData);
    setRoles(rolesData);

    // Map roleId to roleName
    const mappedUsers = usersData.map(user => {
      const role = rolesData.find(r => r.id === user.roleId);
      return { ...user, roleName: role?.roleName || '' };
    });

    // Filter out Super Admin and Administrator
    const filteredUsers = mappedUsers.filter(
      user => user.roleName !== "Super Admin" && user.roleName !== "Administrator"
    );

    setUsers(filteredUsers);
  } catch (error) {
    console.error('Failed to load data', error);
    alert('Failed to load initial data.');
  } finally {
    setIsLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await userService.updateUser(formData.id, formData);
      } else {
        await userService.createUser(formData);
      }
      setShowModal(false);
      fetchInitialData();
    } catch (error) {
      console.error('Failed to save user', error);
      alert('Failed to save user.');
    }
  };

  const openEditModal = (user) => {
    setFormData({
      id: user.id,
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      emailId: user.emailId || '',
      password: '', // intentional clear - enter new to update
      mobileNo: user.mobileNo || '',
      status: user.status || 'A',
      roleId: user.roleId || '',
      companyId: user.companyId || '',
      plantId: user.plantId || '',
      departmentId: user.departmentId || '',
      deptId: user.deptId || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      id: 0,
      firstname: '',
      lastname: '',
      emailId: '',
      password: '',
      mobileNo: '',
      status: 'A',
      roleId: '',
      companyId: '',
      plantId: '',
      departmentId: '',
      deptId: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(id);
        fetchInitialData();
      } catch(error) {
        console.error('Failed to delete user', error);
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors"
        >
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.firstname} {user.lastname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.emailId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mobileNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.companyName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.plantName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status === 'A' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="emailId" value={formData.emailId} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password {!isEditing && <span className="text-red-500">*</span>}</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder={isEditing ? 'Leave blank to keep same' : ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile No</label>
                  <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <select name="companyId" value={formData.companyId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plant</label>
                  <select name="plantId" value={formData.plantId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <option value="">Select Plant</option>
                    {plants.map(p => <option key={p.id} value={p.id}>{p.plantName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Cancel
                </button>
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
