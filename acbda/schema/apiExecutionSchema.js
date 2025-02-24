export const ApiExecutionStatus = {
  STARTED: 'Started',
  IN_PROGRESS: 'In-Progress',
  COMPLETED: 'Completed',
  FAILED: 'Failed'
};

export const ApiExecutionSchema = {
  // Execution Details
  uuid: String,
  'execution-start-time': Date,
  'execution-end-time': Date,
  'execution-status': String, // enum from ApiExecutionStatus
  'execution-time-taken': Number,
  'execution-response-size': Number,

  // Request Details
  'namespace-method-id': String,
  'namespace-id': String,
  'namespace-account-id': String,
  'method': String,
  'url': String,
  'queryParams': Array,
  'headers': Array,
  'body': Object,

  // Response Details
  'response-status': Number,
  'response-headers': Object,
  'response-body': Object
}; 