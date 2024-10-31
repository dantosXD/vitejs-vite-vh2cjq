import { Client, Databases, Storage } from 'appwrite';
import { collections } from './collections';
import { DATABASE_ID, BUCKETS } from '../appwrite';

export async function setupAppwrite(client: Client) {
  const databases = new Databases(client);
  const storage = new Storage(client);

  // Create database if it doesn't exist
  try {
    await databases.create(DATABASE_ID, 'FishLog Database');
    console.log('Database created successfully');
  } catch (error: any) {
    if (error.code !== 409) {
      console.error('Error creating database:', error);
      throw error;
    }
    console.log('Database already exists');
  }

  // Create collections
  for (const [key, collection] of Object.entries(collections)) {
    try {
      const result = await databases.createCollection(
        DATABASE_ID,
        key,
        collection.name,
        collection.permissions.read,
        collection.permissions.write
      );
      console.log(`Collection ${key} created successfully`);

      // Create attributes
      for (const attr of collection.attributes) {
        try {
          switch (attr.type) {
            case 'string':
              await databases.createStringAttribute(
                DATABASE_ID,
                key,
                attr.key,
                attr.size,
                attr.required
              );
              break;
            case 'integer':
              await databases.createIntegerAttribute(
                DATABASE_ID,
                key,
                attr.key,
                attr.required,
                attr.min,
                undefined
              );
              break;
            case 'double':
              await databases.createFloatAttribute(
                DATABASE_ID,
                key,
                attr.key,
                attr.required
              );
              break;
            case 'boolean':
              await databases.createBooleanAttribute(
                DATABASE_ID,
                key,
                attr.key,
                attr.required
              );
              break;
            case 'object':
              await databases.createJsonAttribute(
                DATABASE_ID,
                key,
                attr.key,
                attr.required
              );
              break;
            case 'string[]':
              await databases.createStringAttribute(
                DATABASE_ID,
                key,
                attr.key,
                attr.size,
                attr.required,
                true
              );
              break;
          }
          console.log(`Attribute ${attr.key} created successfully for ${key}`);
        } catch (error: any) {
          if (error.code !== 409) {
            console.error(`Error creating attribute ${attr.key}:`, error);
            throw error;
          }
          console.log(`Attribute ${attr.key} already exists for ${key}`);
        }
      }

      // Create indexes
      for (const index of collection.indexes) {
        try {
          await databases.createIndex(
            DATABASE_ID,
            key,
            index.key,
            index.type,
            index.attributes
          );
          console.log(`Index ${index.key} created successfully for ${key}`);
        } catch (error: any) {
          if (error.code !== 409) {
            console.error(`Error creating index ${index.key}:`, error);
            throw error;
          }
          console.log(`Index ${index.key} already exists for ${key}`);
        }
      }
    } catch (error: any) {
      if (error.code !== 409) {
        console.error(`Error creating collection ${key}:`, error);
        throw error;
      }
      console.log(`Collection ${key} already exists`);
    }
  }

  // Create storage buckets
  const bucketConfigs = [
    {
      id: BUCKETS.CATCH_PHOTOS,
      name: 'Catch Photos',
      permissions: ['role:all'],
      fileSizeLimit: 10485760, // 10MB
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    },
    {
      id: BUCKETS.GROUP_AVATARS,
      name: 'Group Avatars',
      permissions: ['role:all'],
      fileSizeLimit: 5242880, // 5MB
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    },
    {
      id: BUCKETS.USER_AVATARS,
      name: 'User Avatars',
      permissions: ['role:all'],
      fileSizeLimit: 5242880, // 5MB
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    },
  ];

  for (const config of bucketConfigs) {
    try {
      await storage.createBucket(
        config.id,
        config.name,
        config.permissions,
        config.fileSizeLimit,
        config.allowedFileExtensions
      );
      console.log(`Bucket ${config.id} created successfully`);
    } catch (error: any) {
      if (error.code !== 409) {
        console.error(`Error creating bucket ${config.id}:`, error);
        throw error;
      }
      console.log(`Bucket ${config.id} already exists`);
    }
  }
}