import axios, {
  AxiosError,
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import React, { MutableRefObject } from 'react';

import { deepCompare, hasFiles } from '../utils';
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

export interface RequestConfig {
  requestConfig?: AxiosRequestConfig;
  keepBusyOnSucess?: boolean;
}

class Form<Data extends Record<string, any>> {
  originalData: MutableRefObject<Data>;

  formState: [FormState<Data>, React.Dispatch<React.SetStateAction<FormState<Data>>>];

  errors: Errors;

  static axios: AxiosInstance;

  static errorMessage = 'Something went wrong. Please try again.';

  constructor(
    formState: [FormState<Data>, React.Dispatch<React.SetStateAction<FormState<Data>>>],
    originalData: MutableRefObject<Data>,
    errorsState: [
      Record<string, string[]>,
      React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
    ],
  ) {
    this.formState = formState;
    this.errors = new Errors(errorsState);
    this.originalData = originalData;
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
    this.setState('data', this.originalData.current);
  }

  isDirty(): boolean {
    return !deepCompare(this.formState[0].data, this.originalData.current);
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
  finishProcessing(config?: RequestConfig) {
    this.formState[1]((state) => ({
      ...state,
      busy: config?.keepBusyOnSucess === true ? true : false,
      successful: true,
      progress: undefined,
    }));
  }

  /**
   * Submit the form via a GET request.
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.submit<T>('get', url, config);
  }

  /**
   * Submit the form via a POST request.
   */
  post<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.submit<T>('post', url, config);
  }

  /**
   * Submit the form via a PATCH request.
   */
  patch<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.submit<T>('patch', url, config);
  }

  /**
   * Submit the form via a PUT request.
   */
  put<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.submit<T>('put', url, config);
  }

  /**
   * Submit the form via a DELETE request.
   */
  delete<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.submit<T>('delete', url, config);
  }

  submit<T = any>(
    method: Method,
    url: string,
    config?: RequestConfig,
  ): Promise<AxiosResponse<T>> {
    this.startProcessing();

    const requestConfig = {
      data: {},
      params: {},
      url,
      method,
      onUploadProgress: this.handleUploadProgress.bind(this),
      ...(config?.requestConfig ?? {}),
    };

    if (method.toLowerCase() === 'get') {
      requestConfig.params = { ...this.data(), ...requestConfig.params };
    } else {
      requestConfig.data = { ...this.data(), ...requestConfig.data };

      if (hasFiles(requestConfig.data) && !requestConfig.transformRequest) {
        requestConfig.transformRequest = [(data) => this.toFormData(data)];
      }
    }

    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      (Form.axios || axios)
        .request(requestConfig)
        .then((response: AxiosResponse<T>) => {
          this.finishProcessing(config);
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

  handleUploadProgress(event: AxiosProgressEvent) {
    this.setState('progress', {
      total: event.total,
      loaded: event.loaded,
      percentage: Math.round((event.loaded * 100) / (event.total || 0)),
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
