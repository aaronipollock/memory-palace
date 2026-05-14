import {
    DEMO_BUNDLED_CUSTOM_ROOM_IMAGE_PATH,
    DEMO_BUNDLED_CUSTOM_ROOM_DEFAULT_NAME,
    DEMO_BUNDLED_CUSTOM_ROOM_DEFAULT_DESCRIPTION
} from '../config/demoSampleRoom';

/**
 * Creates the bundled Oval Office sample custom room (demo account only; server enforces).
 */
export async function createDemoBundledSampleRoom(apiClient) {
    const response = await apiClient.post('/api/custom-rooms', {
        name: DEMO_BUNDLED_CUSTOM_ROOM_DEFAULT_NAME,
        description: DEMO_BUNDLED_CUSTOM_ROOM_DEFAULT_DESCRIPTION,
        imageUrl: DEMO_BUNDLED_CUSTOM_ROOM_IMAGE_PATH,
        anchorPoints: []
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create sample room');
    }
    return response.json();
}
