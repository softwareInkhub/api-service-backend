import express from 'express';
import { makeRequest, makePaginatedRequest } from '../acbda/activities/openApiActivity.js';
import fetch from 'node-fetch';
import { db } from '../acbda/accessor/firebaseAccessor.js';

const router = express.Router();

router.post('/openapi', makeRequest);

router.post('/proxy', async (req, res) => {
    console.log('\n=== OpenAPI Route Start ===');
    console.log('Received proxy request');
    console.log('Request Body:', req.body);
    
    try {
        await makeRequest(req, res);
    } catch (error) {
        console.log('\n=== OpenAPI Route Error ===');
        console.error('Error in proxy route:', error);
        res.status(500).json({
            error: 'Failed to process request',
            details: error.message
        });
    } finally {
        console.log('\n=== OpenAPI Route End ===');
    }
});

router.post('/proxy/paginated', async (req, res) => {
    console.log('\n=== Paginated OpenAPI Route Start ===');
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Encoding', 'identity'); // Disable compression
    
    try {
        await makePaginatedRequest(req, res);
    } catch (error) {
        console.log('\n=== Paginated OpenAPI Route Error ===');
        console.error('Error in paginated proxy route:', error);
        res.status(500).json({
            error: 'Failed to process paginated request',
            details: error.message
        });
    }
});

router.get('/executions/:requestId', async (req, res) => {
    try {
        const snapshot = await db.collection('api-execution')
            .where('uuid', '==', req.params.requestId)
            .get();
        
        const execution = snapshot.docs.map(doc => doc.data())[0];
        res.status(200).json(execution);
    } catch (error) {
        console.error('Error fetching execution:', error);
        res.status(500).json({ error: 'Failed to fetch execution details' });
    }
});

router.get('/executions/paginated/:startTime', async (req, res) => {
    try {
        const snapshot = await db.collection('api-execution')
            .where('execution-start-time', '>=', new Date(parseInt(req.params.startTime)))
            .orderBy('execution-start-time', 'asc')
            .get();
        
        const executions = snapshot.docs.map(doc => doc.data());
        res.status(200).json(executions);
    } catch (error) {
        console.error('Error fetching executions:', error);
        res.status(500).json({ error: 'Failed to fetch executions' });
    }
});

export default router; 