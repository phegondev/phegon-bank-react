import { useState, useEffect } from "react";
import { apiService } from '../services/api';




const Transfer = () => {

    const [formData, setFormData] = useState({
        amount: '',
        accountNumber: '',
        destinationAccountNumber: '',
        description: ''
    });


    const [userAccounts, setUserAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [destinationAccountInfo, setDestinationAccountInfo] = useState(null);
    const [verifyingAccount, setVerifyingAccount] = useState(false);


    useEffect(() => {

        const fetchUserAccounts = async () => {
            try {

                const response = await apiService.getMyAccounts();

                if (response.data.statusCode === 200) {
                    setUserAccounts(response.data.data);

                    if (response.data.data.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            accountNumber: response.data.data[0].accountNumber
                        }));
                    }
                }


            } catch (error) {
                console.log(error)
            }
        }
        fetchUserAccounts()
    }, []);




    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };



    const verifyDestinationAccount = async () => {
        if (!formData.destinationAccountNumber.trim()) {
            setError('Please enter a destination account number');
            return;
        }

        if (formData.accountNumber === formData.destinationAccountNumber) {
            setError('Source and destination accounts cannot be the same');
            return;
        }

        setVerifyingAccount(true);
        setError('');
        setDestinationAccountInfo(null);

        try {

            const response = await apiService.findAccountByAccountNumber(formData.destinationAccountNumber);
            const account = response.data || [];

            if (account.accountNumber) {
                setDestinationAccountInfo(account);
                setSuccess(`Account verified: ${account.accountType} Account`);
            } else {
                setError('Destination account not found. Please check the account number.');
            }
        } catch (error) {
            setError('Error verifying destination account ', error);
            console.error('Account verification error:', error);
        } finally {
            setVerifyingAccount(false);
        }
    };


    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate form
        if (!formData.amount || !formData.destinationAccountNumber) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            setError('Amount must be greater than 0');
            setLoading(false);
            return;
        }

        if (formData.accountNumber === formData.destinationAccountNumber) {
            setError('Source and destination accounts cannot be the same');
            setLoading(false);
            return;
        }


        // Check if destination account is verified
        if (!destinationAccountInfo) {
            setError('Please verify the destination account before transferring');
            setLoading(false);
            return;
        }


        // Check if source account has sufficient balance
        const sourceAccount = userAccounts.find(acc => acc.accountNumber === formData.accountNumber);
        if (sourceAccount && parseFloat(formData.amount) > sourceAccount.balance) {
            setError('Insufficient balance in source account');
            setLoading(false);
            return;
        }


        try {

            const transferData = {
                transactionType: 'TRANSFER',
                amount: parseFloat(formData.amount),
                accountNumber: formData.accountNumber,
                destinationAccountNumber: formData.destinationAccountNumber,
                description: formData.description || null
            }

            const response = await apiService.makeTransfer(transferData);


            if (response.data.statusCode === 200) {
                setSuccess('Transfer completed successfully!');
                // Reset form
                setFormData({
                    amount: '',
                    destinationAccountNumber: '',
                    description: '',
                    accountNumber: userAccounts[0]?.accountNumber || ''
                });


                setDestinationAccountInfo(null);

                // Refresh user data after successful transfer
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                setError(response.data.message || 'Transfer failed');
            }

        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred during transfer');

        } finally {

            setLoading(false);
        }
    }

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };





    return (
        <div className="transfer-container">
            <div className="transfer-header">
                <h1>Make a Transfer</h1>
            </div>

            <div className="transfer-content">

                <div className="transfer-form-section">

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <form onSubmit={handleSubmit} className="transfer-form">
                        <div className="form-group">
                            <label htmlFor="accountNumber">From Account</label>
                            <select
                                id="accountNumber"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                required
                            >
                                {userAccounts.map(account => (
                                    <option key={account.id} value={account.accountNumber}>
                                        {account.accountNumber} - {account.accountType} ({account.currency} {account.balance.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="destinationAccountNumber">Destination Account Number *</label>
                            <input
                                type="text"
                                id="destinationAccountNumber"
                                name="destinationAccountNumber"
                                value={formData.destinationAccountNumber}
                                onChange={handleChange}
                                placeholder="Enter destination account number"
                                required
                            />

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={verifyDestinationAccount}
                                disabled={verifyingAccount || !formData.destinationAccountNumber}
                            >
                                {verifyingAccount ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>

                        {destinationAccountInfo && (
                            <div className="account-info">
                                <h4>Destination Account Verified</h4>
                                <div className="account-details">
                                    <p><strong>Account Type:</strong> {destinationAccountInfo.accountType}</p>
                                    <p><strong>Account Number:</strong> {destinationAccountInfo.accountNumber}</p>
                                    <p><strong>Status:</strong> <span className={`status ${destinationAccountInfo.status.toLowerCase()}`}>{destinationAccountInfo.status}</span></p>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="amount">Amount *</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                required
                            />
                            {formData
                            .amount && (
                                <div className="balance-check">
                                    <small>
                                        Available: {formatCurrency(
                                            userAccounts.find(acc => acc.accountNumber === formData.accountNumber)?.balance || 0
                                        )}
                                    </small>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Optional description"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary transfer-btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing Transfer...' : 'Transfer Money'}
                        </button>
                    </form>
                </div>

                <div className="transfer-guidelines">
                    <h3>Transfer Guidelines</h3>
                    <ul>
                        <li>Transfers are processed instantly</li>
                        <li>Ensure the destination account number is correct</li>
                        <li>Double-check the amount before confirming</li>
                        <li>Transfers cannot be reversed once processed</li>
                        <li>Contact support if you encounter any issues</li>
                    </ul>
                </div>

            </div>
        </div>
    );


}

export default Transfer;