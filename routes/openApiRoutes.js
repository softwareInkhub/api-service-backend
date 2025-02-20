import express from 'express';
import { makeRequest } from '../acbda/activities/openApiActivity.js';

const router = express.Router();

router.post('/openapi', makeRequest);

export default router; 