import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="not-found-animation">
                    <div className="not-found-number">4</div>
                    <div className="not-found-zero">
                        <div className="not-found-inner-circle"></div>
                    </div>
                    <div className="not-found-number">4</div>
                </div>

                <h1 className="not-found-title">Page Not Found</h1>

                <p className="not-found-message">
                    Oops! The page you're looking for seems to have wandered off into the digital wilderness.
                </p>

                <div className="not-found-actions">
                    <Link to="/home" className="btn btn-primary">
                        Go Home
                    </Link>
                    <button onClick={() => window.history.back()} className="btn btn-secondary">
                        Go Back
                    </button>
                </div>

                <div className="not-found-tips">
                    <h3>While you're here, you might want to:</h3>
                    <ul>
                        <li>Check the URL for typos</li>
                        <li>Return to our homepage</li>
                        <li>Contact support if you believe this is an error</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NotFound;