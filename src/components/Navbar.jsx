import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";


const Navbar = () => {

    const isAdmin = apiService.isAdmin();
    const isAuthenticated = apiService.isAuthenticated();
    const isAuditor = apiService.isAuditor();

    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setShowModal(true)
    }

    const confirmLogout = () => {
        apiService.logout();
        setShowModal(false)
        navigate("/login")
    }

    const cancelLogout = () => {
        setShowModal(false);
    };


    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Phegon Bank
                </Link>
                <ul className="navbar-menu">
                    <li className="navbar-item">
                        <Link to="/home" className="navbar-link">Home</Link>
                    </li>
                    {isAuthenticated ? (
                        <>
                            <li className="navbar-item">
                                <Link to="/profile" className="navbar-link">Profile</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/transfer" className="navbar-link">Transfer</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/transactions" className="navbar-link">Transactions</Link>
                            </li>
                            {(isAdmin || isAuditor) && (
                                <>
                                    <li className="navbar-item">
                                        <Link to="/auditor-dashboard" className="navbar-link">Auditor Dashboard</Link>
                                    </li>

                                    <li className="navbar-item">
                                        <Link to="/deposit" className="navbar-link">Deposit</Link>
                                    </li>
                                </>
                            )}
                            <li className="navbar-item">
                                <button
                                    className="navbar-link logout-btn"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="navbar-item">
                                <Link to="/login" className="navbar-link">Login</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/register" className="navbar-link">Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <p>Are you sure you want to logout?</p>
                        <div className="modal-actions">
                            <button onClick={confirmLogout} className="btn-confirm">Yes</button>
                            <button onClick={cancelLogout} className="btn-cancel">No</button>
                        </div>
                    </div>
                </div>
            )}

        </nav>
    );
};
export default Navbar;