import { useState, useEffect } from 'react';
import { apiService } from '../services/api';



const AuditorDashboard = () => {


    const [systemTotals, setSystemTotals] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountTransactions, setAccountTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const [userEmail, setUserEmail] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        loadSystemTotals();
    }, []);


    const loadSystemTotals = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await apiService.getSystemTotals();
            if (response.data) {
                setSystemTotals(response.data);
            }
        } catch (err) {
            setError('Failed to load system totals');
            console.error('Error loading system totals:', err);
        } finally {
            setLoading(false);
        }
    };



    const searchUser = async () => {
        if (!userEmail.trim()) {
            setError('Please enter an email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await apiService.findUserByEmail(userEmail.trim());
            if (response.data) {
                setSelectedUser(response.data);
                setActiveTab('user');
            } else {
                setError('User not found');
            }
        } catch (err) {
            setError('User not found or error loading user data');
            console.error('Error loading user:', err);
        } finally {
            setLoading(false);
        }
    };


    const searchAccount = async () => {
        if (!accountNumber.trim()) {
            setError('Please enter an account number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await apiService.findAccountByAccountNumber(accountNumber.trim());
            if (response.data) {
                setSelectedAccount(response.data);
                setActiveTab('account');
            } else {
                setError('Account not found');
            }
        } catch (err) {
            setError('Account not found or error loading account data');
            console.error('Error loading account:', err);
        } finally {
            setLoading(false);
        }
    };




    const loadAccountTransactions = async (accountNum) => {
        setLoading(true);
        setError('');

        try {
            const response = await apiService.getTransactionsByAccountNumber(accountNum);
            if (response.data) {
                setAccountTransactions(response.data);
                setActiveTab('transactions');
            } else {
                setError('No transactions found');
            }
        } catch (err) {
            setError('Error loading transactions');
            console.error('Error loading transactions:', err);
        } finally {
            setLoading(false);
        }
    };



    const searchTransaction = async () => {
        const id = parseInt(transactionId, 10);
        if (isNaN(id) || id <= 0) {
            setError('Please enter a valid transaction ID');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await apiService.getTransactionById(id);
            if (response.data) {
                setSelectedTransaction(response.data);
                setActiveTab('transaction');
            } else {
                setError('Transaction not found');
            }
        } catch (err) {
            setError('Transaction not found or error loading transaction data');
            console.error('Error loading transaction:', err);
        } finally {
            setLoading(false);
        }
    };


    const clearSearch = () => {
        setSelectedUser(null);
        setSelectedAccount(null);
        setAccountTransactions([]);
        setSelectedTransaction(null);
        setUserEmail('');
        setAccountNumber('');
        setTransactionId('');
        setError('');
        setActiveTab('overview');
    };



    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };



    return (
        <div className="auditor-dashboard">
            <div className="dashboard-header">
                <h1>Auditor Dashboard</h1>
                <button className="btn btn-secondary" onClick={clearSearch}>Clear Search</button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading">Loading...</div>}

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    Search
                </button>
                <button
                    className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
                    onClick={() => setActiveTab('user')}
                    disabled={!selectedUser}
                >
                    User Details
                </button>
                <button
                    className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                    disabled={!selectedAccount}
                >
                    Account Details
                </button>
                <button
                    className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                    disabled={accountTransactions.length === 0}
                >
                    Transactions
                </button>
                <button
                    className={`tab-btn ${activeTab === 'transaction' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transaction')}
                    disabled={!selectedTransaction}
                >
                    Transaction Details
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="tab-content">
                    <div className="overview-cards">
                        <div className="stat-card">
                            <h3>Total Users</h3>
                            <p className="stat-number">{systemTotals?.totalUsers || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Accounts</h3>
                            <p className="stat-number">{systemTotals?.totalAccounts || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Transactions</h3>
                            <p className="stat-number">{systemTotals?.totalTransactions || 0}</p>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="action-buttons">
                            <button className="btn btn-primary" onClick={() => setActiveTab('search')}>
                                Search Records
                            </button>
                            <button className="btn btn-secondary" onClick={loadSystemTotals}>
                                Refresh Statistics
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'search' && (
                <div className="tab-content">
                    <div className="search-forms">
                        <div className="search-form">
                            <h3>Search User by Email</h3>
                            <div className="form-group">
                                <input
                                    type="email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="form-input"
                                />
                                <button className="btn btn-primary" onClick={searchUser}>Search User</button>
                            </div>
                        </div>

                        <div className="search-form">
                            <h3>Search Account by Number</h3>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="Enter account number"
                                    className="form-input"
                                />
                                <button className="btn btn-primary" onClick={searchAccount}>Search Account</button>
                            </div>
                        </div>

                        <div className="search-form">
                            <h3>Search Transaction by ID</h3>
                            <div className="form-group">
                                <input
                                    type="number"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction ID"
                                    className="form-input"
                                />
                                <button className="btn btn-primary" onClick={searchTransaction}>Search Transaction</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'user' && selectedUser && (
                <div className="tab-content">
                    <div className="user-details">
                        <h2>User Details</h2>
                        <div className="detail-card">
                            <div className="detail-row">
                                <span className="label">Name:</span>
                                <span className="value">{selectedUser.firstName} {selectedUser.lastName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Email:</span>
                                <span className="value">{selectedUser.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Phone:</span>
                                <span className="value">{selectedUser.phoneNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className={`value ${selectedUser.active ? 'active' : 'inactive'}`}>
                                    {selectedUser.active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Auth Provider:</span>
                                <span className="value">{selectedUser.authProvider}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Roles:</span>
                                <span className="value">
                                    {selectedUser.roles.map(role => (
                                        <span key={role.id} className="role-badge">{role.name}</span>
                                    ))}
                                </span>
                            </div>
                        </div>

                        <h3>Accounts</h3>
                        {selectedUser.accounts.map(account => (
                            <div key={account.id} className="account-card">
                                <div className="account-header">
                                    <h4>{account.accountType} Account - {account.accountNumber}</h4>
                                    <span className={`status ${account.status.toLowerCase()}`}>{account.status}</span>
                                </div>
                                <div className="account-details">
                                    <p>Balance: {formatCurrency(account.balance, account.currency)}</p>
                                    <p>Created: {formatDate(account.createdAt)}</p>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => loadAccountTransactions(account.accountNumber)}
                                    >
                                        View Transactions
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'account' && selectedAccount && (
                <div className="tab-content">
                    <div className="account-details">
                        <h2>Account Details</h2>
                        <div className="detail-card">
                            <div className="detail-row">
                                <span className="label">Account Number:</span>
                                <span className="value">{selectedAccount.accountNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Type:</span>
                                <span className="value">{selectedAccount.accountType}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Balance:</span>
                                <span className="value">{formatCurrency(selectedAccount.balance, selectedAccount.currency)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className={`value ${selectedAccount.status.toLowerCase()}`}>{selectedAccount.status}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Created:</span>
                                <span className="value">{formatDate(selectedAccount.createdAt)}</span>
                            </div>
                        </div>

                        <h3>Recent Transactions</h3>
                        <button
                            className="btn btn-primary"
                            onClick={() => loadAccountTransactions(selectedAccount.accountNumber)}
                        >
                            View All Transactions
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && accountTransactions.length > 0 && (
                <div className="tab-content">
                    <div className="transactions-list">
                        <h2>Transactions for Account</h2>
                        {accountTransactions.map(transaction => (
                            <div key={transaction.id} className="transaction-card">
                                <div className="transaction-header">
                                    <h4>{transaction.transactionType} - {formatCurrency(transaction.amount)}</h4>
                                    <span className={`status ${transaction.status.toLowerCase()}`}>{transaction.status}</span>
                                </div>
                                <div className="transaction-details">
                                    <p>Date: {formatDate(transaction.transactionDate)}</p>
                                    <p>Description: {transaction.description}</p>
                                    {transaction.sourceAccount && transaction.destinationAccount && (
                                        <p>From: {transaction.sourceAccount} → To: {transaction.destinationAccount}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'transaction' && selectedTransaction && (
                <div className="tab-content">
                    <div className="transaction-details">
                        <h2>Transaction Details</h2>
                        <div className="detail-card">
                            <div className="detail-row">
                                <span className="label">ID:</span>
                                <span className="value">{selectedTransaction.id}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Amount:</span>
                                <span className="value">{formatCurrency(selectedTransaction.amount)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Type:</span>
                                <span className="value">{selectedTransaction.transactionType}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Date:</span>
                                <span className="value">{formatDate(selectedTransaction.transactionDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Description:</span>
                                <span className="value">{selectedTransaction.description}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className={`value ${selectedTransaction.status.toLowerCase()}`}>
                                    {selectedTransaction.status}
                                </span>
                            </div>
                            {selectedTransaction.sourceAccount && (
                                <div className="detail-row">
                                    <span className="label">Source Account:</span>
                                    <span className="value">{selectedTransaction.sourceAccount}</span>
                                </div>
                            )}
                            {selectedTransaction.destinationAccount && (
                                <div className="detail-row">
                                    <span className="label">Destination Account:</span>
                                    <span className="value">{selectedTransaction.destinationAccount}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}

export default AuditorDashboard;