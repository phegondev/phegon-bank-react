import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';



const UpdateProfile = () => {

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData({
            ...passwordData,
            [name]: value
        });

        // Clear validation errors when user types
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ''
            });
        }
    }

    const validateForm = () => {
        const errors = {}

        if (!passwordData.oldPassword) {
            errors.oldPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }


        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }




    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await apiService.updatePassword(
                passwordData.oldPassword,
                passwordData.newPassword
            );

            if (response.data.statusCode === 200) {
                setSuccess('Password updated successfully');
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });

                setTimeout(() => {
                    navigate('/profile');
                }, 4000);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while updating password');
        } finally {
            setLoading(false);
        }
    };






    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Update Password</h1>
                <button onClick={() => navigate('/profile')} className="btn btn-secondary">
                    Back to Profile
                </button>
            </div>

            <div className="update-profile-content">
                <div className="password-update-section">
                    <h2>Change Your Password</h2>
                    <p className="password-instructions">
                        For security reasons, please enter your current password and then create a new one.
                    </p>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleSubmit} className="password-form">
                        <div className="form-group">
                            <label htmlFor="oldPassword">Current Password</label>
                            <input
                                type="password"
                                id="oldPassword"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                className={validationErrors.oldPassword ? 'error' : ''}
                            />
                            {validationErrors.oldPassword && (
                                <span className="field-error">{validationErrors.oldPassword}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={validationErrors.newPassword ? 'error' : ''}
                            />
                            {validationErrors.newPassword && (
                                <span className="field-error">{validationErrors.newPassword}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={validationErrors.confirmPassword ? 'error' : ''}
                            />
                            {validationErrors.confirmPassword && (
                                <span className="field-error">{validationErrors.confirmPassword}</span>
                            )}
                        </div>

                        <div className="form-buttons">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Updating Password...' : 'Update Password'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <div className="password-guidelines">
                    <h3>Password Guidelines</h3>
                    <ul>
                        <li>Use at least 6 characters</li>
                        <li>Include a mix of letters, numbers, and symbols</li>
                        <li>Avoid using easily guessable information</li>
                        <li>Don't reuse passwords from other accounts</li>
                    </ul>
                </div>
            </div>
        </div>
    );

}

export default UpdateProfile;