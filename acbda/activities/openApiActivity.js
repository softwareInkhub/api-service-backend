import fetch from 'node-fetch';
import { ApiExecutionBuilder } from '../builder/ApiExecutionBuilder.js';
import { apiExecutionDataProvider } from '../dataprovider/apiExecutionDataProvider.js';
import process from 'process';
import axios from 'axios';

export async function makeRequest(req, res) {
    console.log('[Request] Starting single request execution');
    const executionBuilder = new ApiExecutionBuilder();
    
    try {
        const { method, url, queryParams = {}, headers = {}, body = null } = req.body;
        console.log(`[Request] ${method} ${url}`);

        const urlObj = new URL(url);
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value) urlObj.searchParams.append(key, value);
        });

        executionBuilder.setRequestDetails({
            namespaceMethodId: req.body.namespaceMethodId,
            namespaceId: req.body.namespaceId,
            namespaceAccountId: req.body.namespaceAccountId,
            method, url, queryParams, headers, body
        });

        console.log('[DB] Creating execution record:', executionBuilder.execution.uuid);
        await apiExecutionDataProvider.create(executionBuilder.build());

        // Configure fetch options based on method
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: { 'Content-Type': 'application/json', ...headers }
        };

        // Only add body for non-GET/HEAD requests
        if (!['GET', 'HEAD'].includes(method.toUpperCase()) && body) {
            fetchOptions.body = JSON.stringify(body);
        }

        console.log('[API] Making external request');
        const response = await fetch(urlObj.toString(), fetchOptions);

        const responseData = await response.json();
        console.log(`[API] Response received, status: ${response.status}`);

        executionBuilder.setResponseDetails({
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData,
            status: response.status
        });

        console.log('[DB] Updating execution record');
        await apiExecutionDataProvider.update(executionBuilder.execution.uuid, executionBuilder.build());

        console.log('[Response] Sending response to client');
        res.status(response.status).json(responseData);

    } catch (error) {
        console.error('[Error] Request failed:', error.message);
        executionBuilder.setError();
        await apiExecutionDataProvider.update(executionBuilder.execution.uuid, executionBuilder.build());
        res.status(500).json({ error: 'Failed to process request' });
    }
}

// Helper function to extract next URL from Link header
function extractNextUrl(linkHeader) {
    if (!linkHeader) return null;
    
    // Parse link header
    const matches = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    return matches ? matches[1] : null;
}

export async function makePaginatedRequest(req, res) {
    console.log('[Paginated] Starting paginated request');
    try {
        const { method, url, queryParams = {}, headers = {}, body = null } = req.body;
        let currentUrl = url;
        const aggregatedData = [];
        let pageCount = 0;
        const maxIterations = req.body.maxIterations;

        const executionBuilder = new ApiExecutionBuilder();
        executionBuilder.setRequestDetails({
            ...req.body,
            'pagination-page': 1,
            'original-request-url': url
        });
        await apiExecutionDataProvider.create(executionBuilder.build());

        // Configure fetch options
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: { 'Content-Type': 'application/json', ...headers }
        };

        // Only add body for non-GET/HEAD requests
        if (!['GET', 'HEAD'].includes(method.toUpperCase()) && body) {
            fetchOptions.body = JSON.stringify(body);
        }

        const urlObj = new URL(currentUrl);
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value) urlObj.searchParams.append(key, value);
        });

        // Make first request
        console.log('[API] Making first request:', urlObj.toString());
        const response = await fetch(urlObj.toString(), fetchOptions);
        const responseData = await response.json();
        const responseHeaders = Object.fromEntries(response.headers.entries());

        executionBuilder.setResponseDetails({
            headers: responseHeaders,
            data: responseData,
            status: response.status
        });
        await apiExecutionDataProvider.update(executionBuilder.execution.uuid, executionBuilder.build());

        // Process first page data
        if (responseData) {
            if (Array.isArray(responseData)) {
                aggregatedData.push(...responseData);
            } else if (responseData.data && Array.isArray(responseData.data)) {
                aggregatedData.push(...responseData.data);
            } else {
                aggregatedData.push(responseData);
            }
        }

        // Send first iteration response
        res.status(200).json({
            status: response.status,
            metadata: {
                currentPage: 1,
                isFirstIteration: true,
                executionId: executionBuilder.execution.uuid
            },
            data: responseData
        });

        // Start background processing if there are more pages
        currentUrl = extractNextUrl(response.headers.get('link'));
        pageCount = 1;

        if (currentUrl) {
            console.log('[Background] Starting background processing');
            process.nextTick(async () => {
                try {
                    while (currentUrl && (!maxIterations || pageCount < maxIterations)) {
                        pageCount++;
                        console.log(`[Page ${pageCount}] Processing in background`);

                        const nextExecutionBuilder = new ApiExecutionBuilder();
                        nextExecutionBuilder.setRequestDetails({
                            ...req.body,
                            'pagination-page': pageCount,
                            'original-request-url': url
                        });
                        await apiExecutionDataProvider.create(nextExecutionBuilder.build());

                        const nextResponse = await fetch(currentUrl, fetchOptions);
                        const nextResponseData = await nextResponse.json();

                        nextExecutionBuilder.setResponseDetails({
                            headers: Object.fromEntries(nextResponse.headers.entries()),
                            data: nextResponseData,
                            status: nextResponse.status
                        });
                        await apiExecutionDataProvider.update(nextExecutionBuilder.execution.uuid, nextExecutionBuilder.build());

                        if (nextResponseData) {
                            if (Array.isArray(nextResponseData)) {
                                aggregatedData.push(...nextResponseData);
                            } else if (nextResponseData.data && Array.isArray(nextResponseData.data)) {
                                aggregatedData.push(...nextResponseData.data);
                            } else {
                                aggregatedData.push(nextResponseData);
                            }
                        }

                        currentUrl = extractNextUrl(nextResponse.headers.get('link'));
                        console.log(`[Page ${pageCount}] Next URL: ${currentUrl || 'None'}`);
                    }
                    console.log(`[Complete] Background processing finished, total pages: ${pageCount}`);
                } catch (error) {
                    console.error('[Background Error]', error.message);
                }
            });
        } else {
            console.log('[Complete] No more pages to process');
        }

    } catch (error) {
        console.error('[Error] Paginated request failed:', error.message);
        res.status(500).json({
            status: 500,
            error: 'Failed to process paginated request',
            message: error.message,
            data: null
        });
    }
}

export async function executeRequest(req, res) {
    const { method, url, queryParams = {}, headers = {}, body = null } = req.body;
    const executionId = req.body.executionId;

    const execution = new ApiExecutionBuilder()
        .setUuid(executionId)
        .setStatus('Started')
        .setStartTime(Date.now())
        .setMethod(method)
        .setUrl(url);

    try {
        const requestConfig = {
            method: method.toUpperCase(),
            url: url,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            data: body
        };

        // Create initial execution record
        await apiExecutionDataProvider.create(execution.build());

        const response = await axios(requestConfig);
        
        // Update execution with response info but don't store body
        execution
            .setStatus('Completed')
            .setEndTime(Date.now())
            .setResponse(response);

        // Update execution record
        await apiExecutionDataProvider.update(executionId, execution.build());

        // Return full response to client
        return response;
    } catch (error) {
        execution
            .setStatus('Failed')
            .setEndTime(Date.now())
            .setErrorMessage(error.message);

        // Update execution record with error
        await apiExecutionDataProvider.update(executionId, execution.build());

        throw error;
    }
} 