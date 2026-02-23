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
    },

    /**
     * Fetch a single product by ID
     */
    async getProductById(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/search/product/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    /**
     * Fetch a single livestock item by ID
     */
    async getLivestockById(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/search/livestock/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching livestock:', error);
            throw error;
        }
    },

    /**
     * Fetch products and livestock for the Explore/Buy Stocks page
     * @param {string} category Optional category filter
     */
    async explore(category = '') {
        try {
            const response = await axios.get(`${API_BASE_URL}/search/explore/`, {
                params: { category: category === 'All' ? '' : category }
            });
            return response.data.results || [];
        } catch (error) {
            console.error('Explore error:', error);
            return [];
        }
    }
};

export default SearchService;
