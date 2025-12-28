import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Wrapper page component that triggers the upload modal
 * This maintains backward compatibility with the /custom-rooms/upload route
 * The modal will appear over the current page content
 */
const UploadRoomPhotoPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Dispatch event to open modal (if UserDashboard or other component is listening)
        const event = new CustomEvent('openUploadModal');
        window.dispatchEvent(event);

        // Go back to previous page if possible, otherwise go to home
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    // Return null since we're redirecting immediately
    return null;
};

export default UploadRoomPhotoPage;
