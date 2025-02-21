import express from 'express';
import { makeRequest } from '../acbda/activities/openApiActivity.js';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/openapi', makeRequest);

router.post('/proxy', async (req, res) => {
  try {
    const { method, url, queryParams, headers, body } = req.body;

    // Build URL with query parameters
    const urlObj = new URL(url);
    Object.entries(queryParams).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value);
    });

    // Make the request
    const response = await fetch(urlObj.toString(), {
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });

    // Get response data
    const data = await response.json();
    const responseHeaders = Object.fromEntries(response.headers.entries());

    // Send response back to client
    res.json({
      status: response.status,
      data,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({
      status: 500,
      data: { error: 'Failed to proxy request' },
      headers: {}
    });
  }
});

export default router; 