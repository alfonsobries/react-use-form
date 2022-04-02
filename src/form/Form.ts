import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import React from 'react';

import { deepCopy, hasFiles } from '../utils';
import Errors from './Errors';

class Form {
  // eslint-disable-next-line no-undef
  [key: string]: any;

  originalData: Record<string, any> = {};

  dataState: [
    Record<string, unknown>,
    React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
  ];

  errors: Errors;

  busy: boolean = false;

  successful: boolean = false;

  static axios: AxiosInstance;
  static errorMessage = 'Something went wrong. Please try again.';
  static recentlySuccessfulTimeout = 2000;
  // progress: boolean = false;
  // recentlySuccessful: boolean = false;

  constructor(
    dataState: [
      Record<string, unknown>,
      React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
    ],
    errorsState: [
      Record<string, string[]>,
      React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
    ],
  ) {
    this.dataState = dataState;
    this.errors = new Errors(errorsState);
    this.originalData = deepCopy(dataState[0]);
  }

  getField(key: string): any {
    return this.dataState[0][key];
  }

  set(key: string, value: any): void {
    this.dataState[1]({ ...this.dataState[0], [key]: value });
  }

  keys(): string[] {
    return Object.keys(this.dataState[0]);
  }

  fill(data: Record<string, any> = {}) {
    this.dataState[1]({ ...this.dataState[0], ...data });
  }

  data(): Record<string, any> {
    return this.keys().reduce(
      (data, key) => ({ ...data, [key]: this.getField(key) }),
      {},
    );
  }

  reset(): void {
    this.dataState[1](this.originalData);
  }

  /**
   * Start processing the form.
   */
  startProcessing() {
    this.errors.clear();
    this.busy = true;
    this.successful = false;
    // this.progress = undefined;
    // this.recentlySuccessful = false;
    // clearTimeout(this.recentlySuccessfulTimeoutId);
  }

  /**
   * Finish processing the form.
   */
  finishProcessing() {
    this.busy = false;
    this.successful = true;
    this.progress = undefined;
    // this.recentlySuccessful = true;
    // this.recentlySuccessfulTimeoutId = setTimeout(() => {
    //   this.recentlySuccessful = false;
    // }, Form.recentlySuccessfulTimeout);
  }

  /**
   * Submit the form via a GET request.
   */
  get<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.submit('get', url, config);
  }

  /**
   * Submit the form via a POST request.
   */
  post<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.submit('post', url, config);
  }

  /**
   * Submit the form via a PATCH request.
   */
  patch<T = any>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    return this.submit('patch', url, config);
  }

  /**
   * Submit the form via a PUT request.
   */
  put<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.submit('put', url, config);
  }

  /**
   * Submit the form via a DELETE request.
   */
  delete<T = any>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    return this.submit('delete', url, config);
  }

  submit<T = any>(
    method: string,
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    this.startProcessing();

    config = {
      data: {},
      params: {},
      url,
      method: method as any,
      onUploadProgress: this.handleUploadProgress.bind(this),
      ...config,
    };

    if (method.toLowerCase() === 'get') {
      config.params = { ...this.data(), ...config.params };
    } else {
      config.data = { ...this.data(), ...config.data };

      // if (hasFiles(config.data) && !config.transformRequest) {
      //   config.transformRequest = [data => serialize(data)]
      // }
    }

    return new Promise((resolve, reject) => {
      (Form.axios || axios)
        .request(config)
        .then((response: AxiosResponse) => {
          this.finishProcessing();
          resolve(response);
        })
        .catch((error: AxiosError) => {
          this.handleErrors(error);
          reject(error);
        });
    });
  }

  /**
   * Handle the errors.
   */
  handleErrors(error: AxiosError) {
    this.busy = false;
    this.progress = undefined;

    if (error.response) {
      this.errors.set(this.extractErrors(error.response));
    }
  }

  /**
   * Extract the errors from the response object.
   */
  extractErrors(response: AxiosResponse): Record<string, any> {
    if (!response.data || typeof response.data !== 'object') {
      return { error: Form.errorMessage };
    }

    if (response.data.errors) {
      return { ...response.data.errors };
    }

    if (response.data.message) {
      return { error: response.data.message };
    }

    return { ...response.data };
  }

  /**
   * Handle the upload progress.
   */
  handleUploadProgress(event: ProgressEvent) {
    this.progress = {
      total: event.total,
      loaded: event.loaded,
      percentage: Math.round((event.loaded * 100) / event.total),
    };
  }
}

export default Form;
