import { useState, useEffect, useRef } from "react";
import { apiService } from "../services/api";


const Profile = () => {

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);


    const fetchUserProfile = async () => {
        setLoading(true);
        setError('')

        try {
            const response = await apiService.getMyProfile();

            if (response.data.statusCode === 200) {
                setUserData(response.data.data)
            } else {
                setError(response.data.message);
            }

        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while fetching profile data');
        } finally {
            setLoading(false)
        }
    }

    const uploadProfilePictureFile = async (file) => {
        setUploading(true);
        setError('');
        setSuccess('');

        try {

            const response = await apiService.uploadProfilePicture(file);

            if (response.data.statusCode === 200) {
                setSuccess('Profile picture updated successfully!');
                await fetchUserProfile();

                setTimeout(() => {
                    setSuccess('')
                }, 4000)
            }

        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while uploading profile picture');

        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should be less than 5MB');
                return
            }

            uploadProfilePictureFile(file);

        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };



    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Loading your profile information...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="profile-container">
                <div className="error-message">No profile data available</div>
            </div>
        );
    }





    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <a href="/update-profile" className="btn btn-primary">Change Password</a>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="profile-content">
                <div className="profile-picture-section">
                    <h2>Profile Picture</h2>
                    <div className="profile-picture-upload">
                        <div className="profile-picture">
                            <img
                                src={userData.profilePictureUrl}
                                alt="Profile"
                            />
                        </div>

                        <div className="upload-controls">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            <button
                                onClick={triggerFileInput}
                                className="btn btn-primary"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Change Picture'}
                            </button>

                        </div>

                        <p className="upload-note">
                            Supported formats: JPG, PNG, GIF. Max size: 5MB
                        </p>
                    </div>
                </div>

                <div className="profile-info">
                    <h2>Personal Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>First Name</label>
                            <p>{userData.firstName || 'Not available'}</p>
                        </div>
                        <div className="info-item">
                            <label>Last Name</label>
                            <p>{userData.lastName || 'Not available'}</p>
                        </div>
                        <div className="info-item">
                            <label>Email</label>
                            <p>{userData.email || 'Not available'}</p>
                        </div>
                        <div className="info-item">
                            <label>Phone Number</label>
                            <p>{userData.phoneNumber || 'Not available'}</p>
                        </div>
                        <div className="info-item">
                            <label>Status</label>
                            <p className={userData.active ? 'status active' : 'status inactive'}>
                                {userData.active ? 'ACTIVE' : 'INACTIVE'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="accounts-section">
                    <h2>My Accounts</h2>
                    {userData.accounts && userData.accounts.length > 0 ? (
                        userData.accounts.map(account => (
                            <div key={account.id} className="account-card">
                                <div className="account-header">
                                    <h3>{account.accountType} Account</h3>
                                    <span className={`status ${account.status.toLowerCase()}`}>
                                        {account.status}
                                    </span>
                                </div>
                                <div className="account-details">
                                    <div className="account-number">
                                        <label>Account Number</label>
                                        <p>{account.accountNumber}</p>
                                    </div>
                                    <div className="account-balance">
                                        <label>Balance</label>
                                        <p>{account.currency} {account.balance.toFixed(2)}</p>
                                    </div>
                                    <div className="account-created">
                                        <label>Created On</label>
                                        <p>{new Date(account.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="transactions-section">
                                    <h4>Recent Transactions</h4>
                                    {account.transactions && account.transactions.length > 0 ? (
                                        <div className="transactions-list">
                                            {account.transactions.slice(0, 5).map(transaction => (
                                                <div key={transaction.id} className="transaction-item">
                                                    <div className="transaction-info">
                                                        <span className="transaction-type">{transaction.transactionType}</span>
                                                        <span className="transaction-date">
                                                            {new Date(transaction.transactionDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="transaction-details">
                                                        <p className="transaction-description">{transaction.description}</p>
                                                        <p className={`transaction-amount ${transaction.transactionType.toLowerCase()}`}>
                                                            {transaction.transactionType === 'WITHDRAWAL' ||
                                                                transaction.transactionType === 'TRANSFER' ? '-' : '+'}
                                                            {account.currency} {Math.abs(transaction.amount).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    {transaction.sourceAccount && transaction.destinationAccount && (
                                                        <div className="transaction-accounts">
                                                            <small>
                                                                From: {transaction.sourceAccount} → To: {transaction.destinationAccount}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No transactions found</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No accounts found</p>
                    )}
                </div>
            </div>
        </div>
    );

}

export default Profile;