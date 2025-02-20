import express from 'express';
import { 
    createClient, 
    getAllClients, 
    getClientById, 
    updateClient, 
    deleteClient 
} from '../acbda/activities/clientActivity.js';

const router = express.Router();

// Create new client
router.post('/createClient', createClient);

// Get all clients
router.get('/getAllClients', getAllClients);

// Get client by ID
router.get('/getClientById/:id', getClientById);

// Update client
router.put('/updateClient/:id', updateClient);

// Delete client
router.delete('/deleteClient/:id', deleteClient);

export default router; 