import { useEffect, useState } from "react";
import { apiService } from "../services/api";



const Transactions = () => {


    const [transactions, setTransactions] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [userAccounts, setUserAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        pageSize: 2,
        totalItems: 0
    });


    useEffect(() => {
        const fetchUserAccounts = async () => {
            try {
                const response = await apiService.getMyAccounts();
                if (response.data.statusCode === 200) {
                    setUserAccounts(response.data.data);
                    setSelectedAccount(response.data.data[0].accountNumber);
                }

            } catch (error) {
                console.log(error)
            }
        }

        fetchUserAccounts();
    }, [])



    useEffect(() => {

        if (selectedAccount) {
            fetchTransactions(selectedAccount, 0);
        }

    }, [selectedAccount]);


    const fetchTransactions = async (accountNumber, page) => {

        setLoading(true);
        setError('');

        try {
            const response = await apiService.getTransactions(accountNumber, page, pagination.pageSize);
            if (response.data.statusCode === 200) {
                setTransactions(response.data.data);
                setPagination({
                    currentPage: response.data.meta.currentPage,
                    totalPages: response.data.meta.totalPages,
                    pageSize: response.data.meta.pageSize,
                    totalItems: response.data.meta.totalItems
                });
            } else {
                setError(response.data.message);
            }

        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while fetching transactions');

        } finally {
            setLoading(false)
        }
    }


    const handleAccountChange = (e) => {
        setSelectedAccount(e.target.value);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchTransactions(selectedAccount, newPage);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatAmount = (amount, type, destinationAccount) => {
        let sign = '-';

        if (type === 'DEPOSIT') {
            sign = '+';
        }
        else if (type === 'TRANSFER' && destinationAccount === selectedAccount) {
            sign = '+';
        }

        return `${sign}$${Math.abs(amount).toFixed(2)}`;
    };




    return (
        <div className="transactions-container">

            <div className="transactions-header">
                <h1>Transaction History</h1>
            </div>

            <div className="transactions-content">
                {error && <div className="error-message">{error}</div>}

                <div className="account-selector">
                    <label htmlFor="accountSelect">Select Account:</label>
                    <select
                        id="accountSelect"
                        value={selectedAccount}
                        onChange={handleAccountChange}
                        disabled={loading}
                    >
                        {userAccounts.map(account => (
                            <option key={account.id} value={account.accountNumber}>
                                {account.accountNumber} - {account.accountType}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="loading">Loading transactions...</div>
                ) : (
                    <>

                        <div className="transactions-list">
                            {transactions.length === 0 ? (
                                <div className="no-transactions">
                                    No transactions found for this account
                                </div>
                            ) : (
                                transactions.map(transaction => (
                                    <div key={transaction.id} className="transaction-item">
                                        <div className="transaction-main">
                                            <div className="transaction-type">{transaction.transactionType}</div>

                                            <div className={`transaction-amount ${transaction.transactionType === 'DEPOSIT' ||
                                                (transaction.transactionType === 'TRANSFER' && transaction.destinationAccount === selectedAccount)
                                                ? 'deposit'
                                                : 'withdrawal'
                                                }`}>
                                                {formatAmount(transaction.amount, transaction.transactionType, transaction.destinationAccount)}
                                            </div>

                                        </div>
                                        <div className="transaction-details">
                                            <div className="transaction-date">{formatDate(transaction.transactionDate)}</div>
                                            <div className="transaction-description">{transaction.description}</div>
                                            <div className="transaction-status">{transaction.status}</div>
                                            {transaction.sourceAccount && transaction.destinationAccount && (
                                                <div className="transaction-accounts">
                                                    From: {transaction.sourceAccount} → To: {transaction.destinationAccount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>


                        {pagination.totalPages > 0 && (
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 0}
                                    className="pagination-btn"
                                >
                                    Previous
                                </button>
                                <span className="pagination-info">
                                    Page {pagination.currentPage + 1} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages - 1}
                                    className="pagination-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>

        </div>
    )


}

export default Transactions;