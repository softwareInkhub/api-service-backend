import fetch from 'node-fetch';

export async function makeRequest(req, res) {
    // Log incoming request
    console.log('\n=== OpenAPI Request ===');
    console.log('Incoming Request Body:', {
        method: req.body.method,
        url: req.body.url,
        queryParams: req.body.queryParams,
        headers: req.body.headers,
        body: req.body.body
    });

    try {
        const { 
            method, 
            url, 
            queryParams = {}, 
            headers = {}, 
            body = null 
        } = req.body;

        // Log URL construction
        const urlObj = new URL(url);
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value) urlObj.searchParams.append(key, value);
        });
        console.log('\nConstructed URL:', urlObj.toString());
        console.log('Method:', method.toUpperCase());
        console.log('Headers:', {
            'Content-Type': 'application/json',
            ...headers
        });
        console.log('Request Body:', body);

        // Make the request
        const response = await fetch(urlObj.toString(), {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: body ? JSON.stringify(body) : undefined
        });

        // Get response data
        const responseData = await response.json();

        // Log response
        console.log('\n=== OpenAPI Response ===');
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        console.log('Data:', responseData);

        // Return response
        res.status(response.status).json({
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
        });

    } catch (error) {
        // Log error
        console.error('\n=== OpenAPI Error ===');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            error: 'Failed to make request',
            details: error.message
        });
    } finally {
        console.log('\n=== OpenAPI Request End ===\n');
    }
} 