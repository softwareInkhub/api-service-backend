import express from 'express';
import { 
    createClient, 
    getAllClients, 
    getClientById, 
    updateClientById, 
    deleteClientById 
} from '../acbda/activities/clientActivity.js';

const router = express.Router();

// Create new client
router.post('/createClient', createClient);

// Get all clients
router.get('/getAllClients', getAllClients);

// Get client by ID - query param
router.get('/getClientById', getClientById);

// Update client - query param
router.put('/updateClientById', updateClientById);

// Delete client - query param
router.delete('/deleteClientById', deleteClientById);

export default router; 