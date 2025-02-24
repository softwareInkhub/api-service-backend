class ApiExecutionBuilder {
  constructor() {
    this.execution = {
      uuid: '',
      'execution-status': '',
      'execution-start-time': 0,
      'execution-end-time': 0,
      'execution-time-taken': 0,
      'execution-response-size': 0,
      'response-status': 0,
      method: '',
      url: '',
      'error-message': ''
    };
  }

  setUuid(uuid) {
    this.execution.uuid = uuid;
    return this;
  }

  setStatus(status) {
    this.execution['execution-status'] = status;
    return this;
  }

  setStartTime(startTime) {
    this.execution['execution-start-time'] = startTime;
    return this;
  }

  setEndTime(endTime) {
    this.execution['execution-end-time'] = endTime;
    return this;
  }

  setTimeTaken(timeTaken) {
    this.execution['execution-time-taken'] = timeTaken;
    return this;
  }

  setResponse(response) {
    if (response) {
      this.execution['response-status'] = response.status;
      this.execution['execution-response-size'] = JSON.stringify(response.data).length;
    }
    return this;
  }

  setMethod(method) {
    this.execution.method = method;
    return this;
  }

  setUrl(url) {
    this.execution.url = url;
    return this;
  }

  setErrorMessage(errorMessage) {
    this.execution['error-message'] = errorMessage;
    return this;
  }

  build() {
    return this.execution;
  }
} 