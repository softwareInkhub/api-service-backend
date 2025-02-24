import { v4 as uuidv4 } from 'uuid';
import { db } from '../../accessor/firebaseAccessor.js';

class FirebaseClientActivity {
    constructor() {}

    static getInstance() {
        if (!FirebaseClientActivity.instance) {
            FirebaseClientActivity.instance = new FirebaseClientActivity();
        }
        return FirebaseClientActivity.instance;
    }

    async createDocument(collection, data, uuid) {
        try {
            await db.collection(collection).doc(uuid).set(data);
        } catch (error) {
            console.error(`Error creating document in ${collection}:`, error);
            throw error;
        }
    }

    async getDocument(collection, uuid) {
        try {
            const doc = await db.collection(collection).doc(uuid).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`Error getting document from ${collection}:`, error);
            throw error;
        }
    }

    async updateDocument(collection, uuid, data) {
        try {
            await db.collection(collection).doc(uuid).update(data);
        } catch (error) {
            console.error(`Error updating document in ${collection}:`, error);
            throw error;
        }
    }

    async deleteDocument(collection, uuid) {
        try {
            await db.collection(collection).doc(uuid).delete();
        } catch (error) {
            console.error(`Error deleting document from ${collection}:`, error);
            throw error;
        }
    }

    async getAllDocuments(collectionName) {
        try {
            console.log('Inside getAllDocuments: ' + collectionName);
            const snapshot = await db.collection(collectionName).get();
            const documents = [];
            snapshot.forEach(doc => {
                documents.push({ id: doc.id, ...doc.data() });
            });

            console.log('documents: ', documents);

            return documents;
        } catch (error) {
            console.error('Error fetching documents:', error);
            throw new Error('Failed to retrieve documents');
        }
    }
}

const firebaseClientActivity = FirebaseClientActivity.getInstance();

export { firebaseClientActivity };
