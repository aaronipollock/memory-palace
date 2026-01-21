import React, { useState, useEffect, useMemo } from 'react';
import { ROOM_ANCHOR_POSITIONS, ROOM_IMAGES } from '../constants/roomData';
import { SecureAPIClient } from '../utils/security';
import { getApiUrl } from '../config/api';

const apiClient = new SecureAPIClient(getApiUrl(''));

const PalacePreview = ({ palace }) => {
  const [customRoomAnchorPoints, setCustomRoomAnchorPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch custom room anchor points if needed
  useEffect(() => {
    const fetchCustomRoom = async () => {
      if (palace.customRoomId) {
        setLoading(true);
        try {
          const response = await apiClient.get(`/api/custom-rooms/${palace.customRoomId}`);
          if (response.ok) {
            const roomData = await response.json();
            setCustomRoomAnchorPoints(roomData.anchorPoints || []);
          }
        } catch (err) {
          console.error('Error fetching custom room for preview:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setCustomRoomAnchorPoints([]);
      }
    };
    fetchCustomRoom();
  }, [palace.customRoomId]);

  // Get anchor positions
  const anchorPositions = useMemo(() => {
    if (palace.customRoomId && customRoomAnchorPoints.length > 0) {
      // Convert custom room anchor points to positions
      const positions = {};
      customRoomAnchorPoints.forEach((point) => {
        positions[point.name] = {
          top: `${point.y}%`,
          left: `${point.x}%`,
          width: '40px',
          height: '40px'
        };
      });
      return positions;
    }
    // Use predefined positions for standard rooms
    return ROOM_ANCHOR_POSITIONS[palace.roomType] || ROOM_ANCHOR_POSITIONS['throne room'];
  }, [palace.customRoomId, palace.roomType, customRoomAnchorPoints]);

  // Get the room image URL with proper URL resolution
  const roomImageUrl = (() => {
    if (palace.customRoomImageUrl) {
      // Handle relative URLs and localhost URLs
      if (palace.customRoomImageUrl.startsWith('/')) {
        return `${getApiUrl('')}${palace.customRoomImageUrl}`;
      }
      if (palace.customRoomImageUrl.includes('localhost')) {
        const backendUrl = getApiUrl('').replace(/\/$/, '');
        return palace.customRoomImageUrl.replace(/https?:\/\/[^\/]+/, backendUrl);
      }
      return palace.customRoomImageUrl;
    }
    return ROOM_IMAGES[palace.roomType] || ROOM_IMAGES['throne room'];
  })();

  // Get accepted images - handle both Map and plain object formats
  const acceptedImages = palace.acceptedImages || {};

  // Convert to plain object if it's a Map-like structure
  const acceptedImagesObj = acceptedImages instanceof Map
    ? Object.fromEntries(acceptedImages)
    : acceptedImages;

  // Helper to get image URL (handle both file paths and data URLs)
  const getImageUrl = (imageData) => {
    if (!imageData || !imageData.image) return null;

    const image = imageData.image;

    // If it's a data URL, return as is
    if (typeof image === 'string' && image.startsWith('data:')) {
      return image;
    }

    // If it's a file path (starts with /), prefix with backend URL
    if (typeof image === 'string' && image.startsWith('/')) {
      return `${getApiUrl('')}${image}`;
    }

    // Otherwise return as is (might be a full URL)
    return image;
  };

  if (loading) {
    return (
      <div className="relative w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading preview...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
      {/* Room Image */}
      <img
        src={roomImageUrl}
        alt={palace.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = '/images/placeholder.png';
        }}
      />

      {/* Overlay accepted images at anchor positions */}
      {Object.keys(acceptedImagesObj).map((anchorName) => {
        const imageData = acceptedImagesObj[anchorName];
        const imageUrl = getImageUrl(imageData);
        const position = anchorPositions[anchorName];

        if (!imageUrl || !position) return null;

        return (
          <div
            key={anchorName}
            className="absolute rounded-md overflow-hidden border-2 border-white shadow-lg"
            style={{
              top: position.top,
              left: position.left,
              width: '36px',
              height: '36px',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
            title={anchorName}
          >
            <img
              src={imageUrl}
              alt={`${anchorName} preview`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PalacePreview;
