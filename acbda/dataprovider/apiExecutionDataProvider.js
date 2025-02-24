import { db } from '../accessor/firebaseAccessor.js';

const COLLECTION = 'api-execution';

export const apiExecutionDataProvider = {
  async create(executionData) {
    try {
      // Clean data before saving
      const cleanData = Object.entries(executionData).reduce((acc, [key, value]) => {
        acc[key] = value === undefined ? null : value;
        return acc;
      }, {});

      await db.collection(COLLECTION).doc(cleanData.uuid).set(cleanData);
      return cleanData;
    } catch (error) {
      console.error('Error creating execution record:', error);
      throw error;
    }
  },

  async get(uuid) {
    try {
      const doc = await db.collection(COLLECTION).doc(uuid).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting execution record:', error);
      throw error;
    }
  },

  async update(uuid, data) {
    try {
      // Clean data before updating
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = value === undefined ? null : value;
        return acc;
      }, {});

      await db.collection(COLLECTION).doc(uuid).update(cleanData);
      return { id: uuid, ...cleanData };
    } catch (error) {
      console.error('Error updating execution record:', error);
      throw error;
    }
  },

  async delete(uuid) {
    try {
      await db.collection(COLLECTION).doc(uuid).delete();
      return true;
    } catch (error) {
      console.error('Error deleting execution record:', error);
      throw error;
    }
  }
}; 