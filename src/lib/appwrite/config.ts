import { Client, Account, Databases, Storage, Functions } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT!);

// Initialize API services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and collection IDs
export const DATABASE_ID = 'fishlog';

export const COLLECTIONS = {
    USERS: 'users',
    CATCHES: 'catches',
    GROUPS: 'groups',
    EVENTS: 'events',
    COMMENTS: 'comments',
    CHALLENGES: 'challenges',
    INVITATIONS: 'invitations',
};

// Storage bucket IDs
export const BUCKETS = {
    CATCH_PHOTOS: 'catch-photos',
    GROUP_AVATARS: 'group-avatars',
    USER_AVATARS: 'user-avatars',
};

// Function IDs
export const FUNCTIONS = {
    PROCESS_CATCH_PHOTO: 'process-catch-photo',
    NOTIFY_GROUP_MEMBERS: 'notify-group-members',
    CLEANUP_EXPIRED_INVITATIONS: 'cleanup-expired-invitations',
};