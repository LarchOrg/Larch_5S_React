//const API_BASE_URL = 'https://localhost:7241/api';
const API_BASE_URL='https://5sAuditapi.larcherp.com/api';

export const questionService = {
    getAll: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Question`);
            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    },

    create: async (question) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(question),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create question');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    },

    update: async (id, question) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Question/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(question),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update question');
            }
            
            // PUT requests usually return 204 No Content, so we don't always need to parse JSON
            return true; 
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Question/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete question');
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    }
};
