import axios from "axios";


const API_BASE_URL = "http://localhost:8090/api"; //local url

// const API_BASE_URL = "http://3.141.18.52:8090/api";//prod url


// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
});


// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
);


// api methods
export const apiService = {

    saveAuthData: (token, roles) => {
        localStorage.setItem('token', token)
        localStorage.setItem('roles', JSON.stringify(roles))
    },

    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('roles')
    },

    hasRole(role) {
        const roels = localStorage.getItem('roles')
        return roels ? JSON.parse(roels).includes(role) : false;
    },

    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    },

    // Check if the user is an admin
    isAdmin() {
        return this.hasRole('ADMIN');
    },

    // Check if the user is an instructor
    isCustomer() {
        return this.hasRole('CUSTOMER');
    },

    // Check if the user is an Auditor
    isAuditor() {
        return this.hasRole('AUDITOR');
    },

    login: (body) => {
        return api.post('/auth/login', body);
    },

    register: (body) => {
        return api.post('/auth/register', body);
    },


    forgetPassword: (body) => {
        return api.post('/auth/forgot-password', body)
    },

    resetPassword: (body) => {
        return api.post('/auth/reset-password', body)
    },


    getMyProfile: () => {
        return api.get('/users/me');
    },

    // Update password
    updatePassword: (oldPassword, newPassword) => {
        return api.put('/users/update-password', {
            oldPassword,
            newPassword
        });
    },


    uploadProfilePicture: (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return api.put('/users/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },


    // ACCOUNT

    getMyAccounts: () => {
        return api.get("/accounts/me")
    },

    // Make a transfer
    makeTransfer: (transferData) => {
        return api.post('/transactions', transferData);
    },

    makeDeposit: (depositDate) => {
        return api.post('/transactions', depositDate);
    },


    // Get transactions for an account
    getTransactions: (accountNumber, page = 0, size = 10) => {
        return api.get(`/transactions/${accountNumber}?page=${page}&size=${size}`);
    },



    //AUDITOR
    // Get system totals
    getSystemTotals: () => {
        return api.get('/audit/totals');
    },

    // Find user by email
    findUserByEmail: (email) => {
        return api.get(`/audit/users?email=${email}`);
    },

    // Find account by account number
    findAccountByAccountNumber: (accountNumber) => {
        return api.get(`/audit/accounts?accountNumber=${accountNumber}`);
    },

    // Get transactions by account number
    getTransactionsByAccountNumber: (accountNumber) => {
        return api.get(`/audit/transactions/by-account?accountNumber=${accountNumber}`);
    },

    // Get transaction by ID
    getTransactionById: (id) => {
        return api.get(`/audit/transactions/by-id?id=${id}`);
    }


}

export default api;
