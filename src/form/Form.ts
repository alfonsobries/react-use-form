import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import React from 'react';

import { deepCopy, hasFiles } from '../utils';
import Errors from './Errors';

export interface FormState<Data extends Record<string, any>> {
  data: Data;
  busy: boolean;
  successful: boolean;
  progress: Progress | undefined;
}

export interface Progress {
  total: number;
  loaded: number;
  percentage: number;
}

class Form<Data extends Record<string, any>> {
  originalData: Data;

  formState: [FormState<Data>, React.Dispatch<React.SetStateAction<FormState<Data>>>];

  errors: Errors;

  static axios: AxiosInstance;

  static errorMessage = 'Something went wrong. Please try again.';

  constructor(
    formState: [FormState<Data>, React.Dispatch<React.SetStateAction<FormState<Data>>>],
    errorsState: [
      Record<string, string[]>,
      React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
    ],
  ) {
    this.formState = formState;
    this.errors = new Errors(errorsState);
    this.originalData = deepCopy<Data>(formState[0].data);
  }

  setState(field: string, value: any) {
    this.formState[1]((state) => ({
      ...state,
      [field]: value,
    }));
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

  fill(data: Partial<Data> = {}) {
    this.setState('data', {
      ...this.formState[0]['data'],
      ...data,
    } as Data);
  }

  data(): Data {
    return this.keys().reduce(
      (data, key) => ({ ...data, [key]: this.getField(key) }),
      {},
    ) as Data;
  }

  reset(): void {
    this.setState('data', this.originalData);
  }

  isDirty(): boolean {
    return !this.keys().every((key) => {
      return this.getField(key) === this.originalData[key];
    });
  }

  /**
   * Start processing the form.
   */
  startProcessing() {
    this.errors.clear();

    this.formState[1]((state) => ({
      ...state,
      busy: true,
      successful: false,
      progress: undefined,
    }));
  }

  /**
   * Finish processing the form.
   */
  finishProcessing() {
    this.formState[1]((state) => ({
      ...state,
      busy: false,
      successful: true,
      progress: undefined,
    }));
  }

  /**
   * Submit the form via a GET request.
   */
  get<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.submit<T>('get', url, config);
  }

  /**
   * Submit the form via a POST request.
   */
  post<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.submit<T>('post', url, config);
  }

  /**
   * Submit the form via a PATCH request.
   */
  patch<T = any>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    return this.submit<T>('patch', url, config);
  }

  /**
   * Submit the form via a PUT request.
   */
  put<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.submit<T>('put', url, config);
  }

  /**
   * Submit the form via a DELETE request.
   */
  delete<T = any>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    return this.submit<T>('delete', url, config);
  }

  submit<T = any>(
    method: Method,
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    this.startProcessing();

    config = {
      data: {},
      params: {},
      url,
      method,
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

    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      (Form.axios || axios)
        .request(config)
        .then((response: AxiosResponse<T>) => {
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
    if (error.response) {
      this.errors.set(this.extractErrors(error.response));
    }

    this.formState[1]((state) => ({
      ...state,
      busy: false,
      progress: undefined,
    }));
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

      if (typeof FileList !== 'undefined' && value instanceof FileList) {
        [].slice.call(value).forEach((file) => formData.append(key, file));
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  }
}

export default Form;
