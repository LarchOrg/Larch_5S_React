import {API_BASE_URL} from "./authService";
//const API_BASE_URL = 'https://localhost:7241/api';
//const API_BASE_URL='https://5sAuditapi.larcherp.com/api';

export const userService = {
    // ... existing saveUser, getUsers, getRoles, etc.

    saveDepartment: async (deptData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/SaveDepartment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deptData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save department');
            }
            return await response.json();
        } catch (error) {
            console.error('Error saving department:', error);
            throw error;
        }
    },
    getUsers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/user`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },
    toggleStatus: async (id) => {
        const res = await fetch(`${API_BASE_URL}/Admin/FsaUsers/${id}/toggle-status`, {
            method: 'PATCH',
        });
        if (!res.ok) throw new Error('Failed to update status');
        return await res.json();
    },

    getRoles: async () => {
        const res = await fetch(`${API_BASE_URL}/user/roles`);
        if (!res.ok) throw new Error('Failed to fetch roles');
        return await res.json();
    },

    getDepartments: async () => {
        const res = await fetch(`${API_BASE_URL}/Admin/Departments`);
        if (!res.ok) throw new Error('Failed to fetch departments');
        return await res.json();
    },

    getPlants: async () => {
        const res = await fetch(`${API_BASE_URL}/user/plants`);
        if (!res.ok) throw new Error('Failed to fetch plants');
        return await res.json();
    },
    updateUser: async (id, userData) => {
        const response = await fetch(`${API_BASE_URL}/user/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to update user');
        }
        return await response.json();
    },

    saveUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/user/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Failed to save user');
        return await response.json();
    }
};