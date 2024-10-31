import { Client, Account, Databases, Storage, Functions, Avatars, ID } from 'appwrite';

// Initialize the Appwrite client
export const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://mentor-db.sustainablegrowthlabs.com/v1')
    .setProject(process.env.APPWRITE_PROJECT || '6723a47b7732b1007525');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const avatars = new Avatars(client);

// Database and collection IDs
export const DATABASE_ID = 'fishlog';
export const COLLECTIONS = {
    USERS: 'users',
    CATCHES: 'catches',
    GROUPS: 'groups',
    EVENTS: 'events',
    COMMENTS: 'comments',
    CHALLENGES: 'challenges',
};

// Storage bucket IDs
export const BUCKETS = {
    CATCH_PHOTOS: 'catch-photos',
    GROUP_AVATARS: 'group-avatars',
    USER_AVATARS: 'user-avatars',
};

// Helper functions
export async function uploadFile(bucketId: string, file: File) {
    try {
        const response = await storage.createFile(
            bucketId,
            ID.unique(),
            file
        );
        return response.$id;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

export async function getFilePreview(bucketId: string, fileId: string) {
    try {
        return storage.getFilePreview(bucketId, fileId);
    } catch (error) {
        console.error('Error getting file preview:', error);
        throw error;
    }
}

export async function deleteFile(bucketId: string, fileId: string) {
    try {
        await storage.deleteFile(bucketId, fileId);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

export async function generateAvatar(name: string) {
    try {
        return avatars.getInitials(name);
    } catch (error) {
        console.error('Error generating avatar:', error);
        throw error;
    }
}