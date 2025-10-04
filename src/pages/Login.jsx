import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";


const Login = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);
        setError('');

        try {

            const response = await apiService.login(formData);

            if (response.data.statusCode === 200) {
                apiService.saveAuthData(response.data.data.token, response.data.data.roles);
                navigate('/home')
            } else {

                setError(response.data.message || 'Login failed');
            }

        } catch (error) {

            setError(error.response?.data?.message || error.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Login to Your Account</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>

                <div className="auth-link">
                    Forgot password? <Link to="/forgot-password">Forgot Password</Link>
                </div>
            </div>
        </div>
    );

}
export default Login;