const API_BASE_URL = 'https://localhost:7241/api';

export const adminService = {
    // GET all users from AdminController
    getUsers: async () => {
        const res = await fetch(`${API_BASE_URL}/Admin/FsaUsers`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return await res.json();
    },

    toggleStatus: async (id) => {
        const res = await fetch(`${API_BASE_URL}/Admin/FsaUsers/${id}/toggle-status`, {
            method: 'PATCH', // Matching the [HttpPatch] in your controller
        });
        if (!res.ok) throw new Error('Failed to update status');
        return await res.json();
    },

    // POST new user to UserController
    createUser: async (userData) => {
        const res = await fetch(`${API_BASE_URL}/Admin/FsaUsers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(errorMsg || 'Failed to create user');
        }
        return await res.json();
    },

    // Edit user
    updateUser: async (id, data) => {
        const response = await fetch(`${API_URL}/Admin/FsaUsers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Update failed with status: ${response.status}`);
        }

        return await response.json();
    },

    // Master Data Methods
    getCompanies: async () => {
        const res = await fetch(`${API_BASE_URL}/Admin/Companies`);
        return await res.json();
    },

    getPlants: async () => {
        const res = await fetch(`${API_BASE_URL}/Admin/Plants`);
        return await res.json();
    },
    getDepartments: async () => {
        const res = await fetch(`${API_BASE_URL}/Admin/Departments`);
        return await res.json();
    },

    getAuditors: async () => {
        const res = await fetch(`${API_BASE_URL}/Admin/Auditors`);
        return await res.json();
    },

    createCompany: async (name) => {
        const res = await fetch(`${API_BASE_URL}/Admin/Companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyName: name }),
        });
        return await res.json();
    },

    createPlant: async (name) => {
        const res = await fetch(`${API_BASE_URL}/Admin/Plants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plantName: name }),
        });
        return await res.json();
    },

    // --- AUDIT CONTROLLER CALLS (Transactions) ---

    getAuditList: async () => {
        const res = await fetch(`${API_BASE_URL}/Audit/List`);
        if (!res.ok) throw new Error('Failed to fetch audit list');
        return await res.json();
    },

    getAuditById: async (id) => {
        const res = await fetch(`${API_BASE_URL}/Audit/${id}`);
        if (!res.ok) throw new Error('Failed to fetch audit details');
        return await res.json();
    },

    initiateAudit: async (payload) => {
        const res = await fetch(`${API_BASE_URL}/Audit/Initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(errorMsg || 'Failed to initiate audit');
        }
        return await res.json();
    },

    updateAudit: async (id, payload) => {
        const res = await fetch(`${API_BASE_URL}/Audit/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update audit');
        return await res.json();
    },

    deleteAudit: async (id) => {
        const res = await fetch(`${API_BASE_URL}/Audit/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete audit');
        }
        return await res.json();
    },
    // --- NEW: CHUNKED UPLOAD ---
    uploadChunk: async (formData) => {
        const res = await fetch(`${API_BASE_URL}/Audit/UploadChunk`, {
            method: 'POST',
            body: formData, // Browser automatically sets multipart/form-data boundary
        });
        if (!res.ok) throw new Error('Chunk upload failed');
        return await res.json();
    },

    // --- NEW: FINAL SUBMISSION ---
    submitEvaluation: async (payload) => {
        const res = await fetch(`${API_BASE_URL}/Audit/SubmitEvaluation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Failed to submit evaluation');
        }
        return await res.json();
    },

    getAuditResults: async (auditId) => {
        const res = await fetch(`${API_BASE_URL}/Audit/Results/${auditId}`);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch audit results');
        }
        return await res.json();
    },

    startAudit: async (auditId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Audit/StartAudit/${auditId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Fetch doesn't throw on 404/500, so we check response.ok (status 200-299)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Fetch error in startAudit:", error);
            throw error;
        }
    },
    getChecklist: async (auditType) => {
        // Normalizing the auditType for the URL
        const res = await fetch(`${API_BASE_URL}/Audit/Checklist/${auditType}`);
        if (!res.ok) throw new Error('Failed to fetch checklist');
        return await res.json();
    },

};