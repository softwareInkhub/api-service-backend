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
    console.log('\n=== Get Client By ID Request ===');
    console.log('Query Parameters:', req.query);
    
    try {
        const { id } = req.query;
        
        if (!id) {
            console.log('Error: Missing ID parameter');
            return res.status(400).json({ error: 'Client ID is required' });
        }

        console.log('Fetching client with ID:', id);
        const doc = await db.collection(clientCollection).doc(id).get();
        
        if (!doc.exists) {
            console.log('Error: Client not found');
            return res.status(404).json({ error: 'Client not found' });
        }

        const clientData = { id: doc.id, ...doc.data() };
        console.log('Client data found:', clientData);
        res.status(200).json(clientData);
    } catch (error) {
        console.error('\n=== Get Client By ID Error ===');
        console.error('Error:', error);
        res.status(404).json({ error: error.message });
    }
}

// Update client
export async function updateClientById(req, res) {
    console.log('\n=== Update Client Request ===');
    console.log('Query Parameters:', req.query);
    console.log('Request Body:', req.body);
    
    try {
        const { id } = req.query;
        if (!id) {
            console.log('Error: Missing ID parameter');
            return res.status(400).json({ error: 'Client ID is required' });
        }

        const updateData = req.body;
        console.log('Updating client with ID:', id);
        console.log('Update data:', updateData);

        await db.collection(clientCollection).doc(id).update({
            ...updateData,
            updatedAt: new Date()
        });

        const updatedData = { id, ...updateData };
        console.log('Client updated successfully:', updatedData);
        res.status(200).json(updatedData);
    } catch (error) {
        console.error('\n=== Update Client Error ===');
        console.error('Error:', error);
        res.status(400).json({ error: error.message });
    }
}

// Delete client
export async function deleteClientById(req, res) {
    console.log('\n=== Delete Client Request ===');
    console.log('Query Parameters:', req.query);
    
    try {
        const { id } = req.query;
        if (!id) {
            console.log('Error: Missing ID parameter');
            return res.status(400).json({ error: 'Client ID is required' });
        }

        console.log('Deleting client with ID:', id);
        await db.collection(clientCollection).doc(id).delete();
        
        console.log('Client deleted successfully');
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('\n=== Delete Client Error ===');
        console.error('Error:', error);
        res.status(400).json({ error: error.message });
    }
}
