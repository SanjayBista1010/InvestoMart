import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const SearchService = {
    /**
     * Perform a global search across products and livestock
     * @param {string} query - The search query
     * @returns {Promise<Array>} - Unified search results
     */
    async search(query) {
        if (!query || query.length < 2) return [];

        try {
            const response = await axios.get(`${API_BASE_URL}/search/`, {
                params: { q: query }
            });
            return response.data.results || [];
        } catch (error) {
            console.error('Search error:', error);
            // Return empty results on error to avoid breaking UI
            return [];
        }
    }
};

export default SearchService;
