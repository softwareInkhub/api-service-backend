import { db } from '../accessor/firebaseAccessor.js';
import { v4 as uuidv4 } from 'uuid';

const clientCollection = 'clients';

// Create a new client
export async function createClient(req, res) {
    // Log incoming request
    console.log('\n=== Create Client Request ===');
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);

    try {
        const { clientName } = req.body;
        
        // Create client document with required fields
        const clientData = {
            uuid: uuidv4(),
            clientName,
            createdAt: new Date().toISOString(),
            createdBy: "system", // You can modify this based on your auth system
            tags: [],
            status: {
                isActive: true,
                lastUpdated: new Date().toISOString()
            }
        };

        await db.collection(clientCollection).doc(clientData.uuid).set(clientData);
        
        // Log response data
        console.log('\n=== Create Client Response ===');
        console.log('Status: 201');
        console.log('Data:', clientData);

        res.status(201).json({
            message: 'Client created successfully',
            data: clientData
        });
    } catch (error) {
        // Log error
        console.error('\n=== Create Client Error ===');
        console.error('Status: 500');
        console.error('Error:', error);

        res.status(500).json({
            error: 'Failed to create client',
            details: error.message
        });
    }
}

// Get all clients      
export async function getAllClients(req, res) {
    console.log('\n=== Get All Clients Request ===');
    try {
        const snapshot = await db.collection(clientCollection).get();
        const clients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('\n=== Get All Clients Response ===');
        console.log('Status: 200');
        console.log('Data:', clients);

        res.status(200).json(clients);
    } catch (error) {
        console.error('\n=== Get All Clients Error ===');
        console.error('Status: 500');
        console.error('Error:', error);

        res.status(500).json({ error: error.message });
    }
}

// Get client by ID
export async function getClientById(req, res) {
    try {
        const doc = await db.collection(clientCollection).doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

// Update client
export async function updateClient(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        await db.collection(clientCollection).doc(id).update({
            ...updateData,
            updatedAt: new Date()
        });
        res.status(200).json({ id, ...updateData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Delete client
export async function deleteClient(req, res) {
    try {
        const { id } = req.params;
        await db.collection(clientCollection).doc(id).delete();
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
