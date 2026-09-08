/**
 * Centralized API Service for MannSetu
 * Handles all HTTP requests with consistent error handling, auth, and response formatting
 */

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';
const AI_SERVICE_BASE_URL = 'http://localhost:8000/ai/v1';

// Store auth token
let authToken = null;

/**
 * Initialize auth token from localStorage
 */
export function initializeAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        authToken = token;
    }
}

/**
 * Get stored auth token
 */
export function getToken() {
    if (!authToken) {
        authToken = localStorage.getItem('token');
    }
    return authToken;
}

/**
 * Store auth token
 */
export function setToken(token) {
    authToken = token;
    localStorage.setItem('token', token);
}

/**
 * Clear auth token
 */
export function clearToken() {
    authToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

/**
 * Get stored user data
 */
export function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Store user data
 */
export function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * Make authenticated request
 */
async function authenticatedRequest(url, options = {}) {
    const token = getToken();
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return fetch(url, options);
}

/**
 * Handle API response
 */
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        // Handle specific error codes
        if (response.status === 401 || response.status === 403) {
            clearToken();
            throw new Error('Unauthorized. Please login again.');
        }

        if (response.status === 404) {
            throw new Error('Resource not found');
        }

        if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
        }

        const message = error.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    // Return JSON if available, otherwise null
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

/**
 * API Service Object
 */
const apiService = {
    // ==================== AUTHENTICATION ====================

    /**
     * Login user
     */
    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await handleResponse(response);

        if (data) {
            setToken(data.token);
            setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role,
                jurisdiction: data.jurisdiction
            });
        }

        return data;
    },

    /**
     * Logout user
     */
    logout() {
        clearToken();
    },

    /**
     * Register a new user
     */
    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                role: userData.role,
                jurisdiction: userData.jurisdiction
            })
        });

        const data = await handleResponse(response);
        return data;
    },

    // ==================== DASHBOARD ====================

    /**
     * Get dashboard summary
     */
    async getDashboardSummary() {
        const response = await authenticatedRequest(`${API_BASE_URL}/dashboard/summary`);
        return handleResponse(response);
    },

    // ==================== VICTIMS ====================

    /**
     * Get victim trend data
     */
    async getVictimTrend(victimId) {
        const response = await authenticatedRequest(`${API_BASE_URL}/victims/${victimId}/trend`);
        return handleResponse(response);
    },

    // ==================== ALERTS ====================

    /**
     * Get open alerts for counsellor
     */
    async getAlerts(status = 'OPEN', page = 0, size = 10) {
        const url = `${API_BASE_URL}/alerts?status=${status}&page=${page}&size=${size}`;
        const response = await authenticatedRequest(url);
        return handleResponse(response);
    },

    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId, status, outcomeNotes) {
        const response = await authenticatedRequest(`${API_BASE_URL}/alerts/${alertId}/ack`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, outcomeNotes })
        });
        return handleResponse(response);
    },

    // ==================== CHECK-INS ====================

    /**
     * Submit a check-in
     */
    async submitCheckIn(checkInData) {
        const response = await authenticatedRequest(`${API_BASE_URL}/checkins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkInData)
        });
        return handleResponse(response);
    },

    // ==================== AI SERVICE ====================

    /**
     * Score check-in text
     */
    async scoreCheckIn(text, language = 'en', history = [], previousScores = []) {
        const response = await fetch(`${AI_SERVICE_BASE_URL}/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                language,
                recent_history: history,
                previous_dds_scores: previousScores
            })
        });
        return handleResponse(response);
    },

    /**
     * Chat with AI counselor
     */
    async chatWithAI(message, language = 'en') {
        const response = await fetch(`${AI_SERVICE_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                language
            })
        });
        return handleResponse(response);
    },

    /**
     * Transcribe audio
     */
    async transcribeAudio(audioFile) {
        const formData = new FormData();
        formData.append('file', audioFile);

        const response = await fetch(`${AI_SERVICE_BASE_URL}/transcribe`, {
            method: 'POST',
            body: formData
        });
        return handleResponse(response);
    }
};

export default apiService;
