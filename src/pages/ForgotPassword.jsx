import { useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";


const ForgotPassword = () => {


    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {

            const response = await apiService.forgetPassword({ email })

            if (response.data.statusCode === 200) {
                setSuccess('An email with your reset code has been sent to your email address.');
                setEmail('');
            } else {
                setError(response.data.message);
            }
        } catch (error) {

            setError(error.response?.data?.message || 'An error occurred while sending reset email');
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Forgot Password</h2>
                <p className="auth-subtitle">Enter your email address to receive a password reset code</p>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>

                <div className="auth-link">
                    Remember your password? <Link to="/login">Login here</Link>
                </div>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );

}
export default ForgotPassword;