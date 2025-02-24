import { v4 as uuidv4 } from 'uuid';
import { ApiExecutionStatus } from '../schema/apiExecutionSchema.js';

export class ApiExecutionBuilder {
  constructor() {
    this.execution = {
      uuid: uuidv4(),
      'execution-start-time': new Date(),
      'execution-status': ApiExecutionStatus.STARTED,
      'namespace-method-id': null,
      'namespace-id': null,
      'namespace-account-id': null,
      'method': null,
      'url': null,
      'queryParams': [],
      'headers': [],
      'body': null,
      'response-headers': null,
      'response-body': null,
      'execution-end-time': null,
      'execution-time-taken': 0,
      'execution-response-size': 0
    };
  }

  setRequestDetails(request) {
    this.execution = {
      ...this.execution,
      'namespace-method-id': request.namespaceMethodId || null,
      'namespace-id': request.namespaceId || null,
      'namespace-account-id': request.namespaceAccountId || null,
      'method': request.method || 'GET',
      'url': request.url || '',
      'queryParams': request.queryParams || [],
      'headers': request.headers || [],
      'body': request.body || null
    };
    return this;
  }

  setResponseDetails(response) {
    this.execution = {
      ...this.execution,
      'response-status': response.status || 500,
      'response-headers': response.headers || {},
      'response-body': response.data || null,
      'execution-end-time': new Date(),
      'execution-status': ApiExecutionStatus.COMPLETED,
      'execution-time-taken': new Date().getTime() - this.execution['execution-start-time'].getTime(),
      'execution-response-size': JSON.stringify(response.data || {}).length
    };
    return this;
  }

  setError() {
    this.execution = {
      ...this.execution,
      'execution-end-time': new Date(),
      'execution-status': ApiExecutionStatus.FAILED,
      'execution-time-taken': new Date().getTime() - this.execution['execution-start-time'].getTime(),
      'response-body': null,
      'response-headers': null
    };
    return this;
  }

  build() {
    return Object.entries(this.execution).reduce((acc, [key, value]) => {
      acc[key] = value === undefined ? null : value;
      return acc;
    }, {});
  }
} 