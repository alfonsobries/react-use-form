import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import React from 'react';

import { deepCopy, hasFiles } from '../utils';
import Errors from './Errors';

export interface FormState {
  data: Record<string, any>;
  busy: boolean;
  successful: boolean;
  progress: Progress | undefined;
  recentlySuccessful: boolean;
}
export interface Progress {
  total: number;
  loaded: number;
  percentage: number;
}
class Form {
  // eslint-disable-next-line no-undef
  [key: string]: any;

  originalData: Record<string, any> = {};

  formState: [FormState, React.Dispatch<React.SetStateAction<FormState>>];

  errors: Errors;

  static axios: AxiosInstance;
  static errorMessage = 'Something went wrong. Please try again.';
  static recentlySuccessfulTimeout = 2000;

  constructor(
    formState: [FormState, React.Dispatch<React.SetStateAction<FormState>>],
    errorsState: [
      Record<string, string[]>,
      React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
    ],
  ) {
    this.formState = formState;
    this.errors = new Errors(errorsState);
    this.originalData = deepCopy(formState[0].data);
  }

  setState(field: string, value: any) {
    this.formState[1]({
      ...this.formState[0],
      [field]: value,
    });
  }

  getField(key: string): any {
    return this.formState[0]['data'][key];
  }

  set(key: string, value: any): void {
    this.setState('data', {
      ...this.formState[0]['data'],
      [key]: value,
    });
  }

  keys(): string[] {
    return Object.keys(this.formState[0].data);
  }

  fill(data: Record<string, any> = {}) {
    this.setState('data', {
      ...this.formState[0]['data'],
      ...data,
    });
  }

  data(): Record<string, any> {
    return this.keys().reduce(
      (data, key) => ({ ...data, [key]: this.getField(key) }),
      {},
    );
  }

  reset(): void {
    this.setState('data', this.originalData);
  }

  /**
   * Start processing the form.
   */
  startProcessing() {
    this.errors.clear();

    this.formState[1]({
      ...this.formState[0],
      busy: true,
      successful: false,
      progress: undefined,
      recentlySuccessful: false,
    });

    clearTimeout(this.recentlySuccessfulTimeoutId);
  }

  /**
   * Finish processing the form.
   */
  finishProcessing() {
    this.formState[1]({
      ...this.formState[0],
      busy: false,
      successful: true,
      progress: undefined,
      recentlySuccessful: true,
    });

    this.recentlySuccessfulTimeoutId = setTimeout(() => {
      this.recentlySuccessful = false;
    }, Form.recentlySuccessfulTimeout);
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

      if (hasFiles(config.data) && !config.transformRequest) {
        config.transformRequest = [(data) => this.toFormData(data)];
      }
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

  handleErrors(error: AxiosError) {
    this.setState('busy', false);
    this.setState('progress', undefined);

    if (error.response) {
      this.errors.set(this.extractErrors(error.response));
    }
  }

  extractErrors(response: AxiosResponse): Record<string, any> {
    if (!response.data || typeof response.data !== 'object') {
      return { error: [Form.errorMessage] };
    }

    if (response.data.errors) {
      return { ...response.data.errors };
    }

    if (response.data.message) {
      return { error: [response.data.message] };
    }

    return { ...response.data };
  }

  handleUploadProgress(event: ProgressEvent) {
    this.setState('progress', {
      total: event.total,
      loaded: event.loaded,
      percentage: Math.round((event.loaded * 100) / event.total),
    });
  }

  toFormData(data: Record<string, string | Blob>) {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (value instanceof FileList) {
        [].slice.call(value).forEach((file) => formData.append(key, file));
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  }
}

export default Form;
