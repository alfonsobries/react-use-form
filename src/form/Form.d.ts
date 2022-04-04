import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import React from 'react';
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
declare class Form<Data extends Record<string, any>> {
    busy: boolean;
    successful: boolean;
    progress: Progress | undefined;
    originalData: Data;
    formState: [FormState<Data>, React.Dispatch<React.SetStateAction<FormState<Data>>>];
    errors: Errors;
    static axios: AxiosInstance;
    static errorMessage: string;
    constructor(formState: [FormState<Data>, React.Dispatch<React.SetStateAction<FormState<Data>>>], errorsState: [
        Record<string, string[]>,
        React.Dispatch<React.SetStateAction<Record<string, string[]>>>
    ]);
    setState(field: string, value: any): void;
    getField(key: string): any;
    set(key: string, value: any): void;
    keys(): string[];
    fill(data?: Partial<Data>): void;
    data(): Data;
    reset(): void;
    /**
     * Start processing the form.
     */
    startProcessing(): void;
    /**
     * Finish processing the form.
     */
    finishProcessing(): void;
    /**
     * Submit the form via a GET request.
     */
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /**
     * Submit the form via a POST request.
     */
    post<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /**
     * Submit the form via a PATCH request.
     */
    patch<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /**
     * Submit the form via a PUT request.
     */
    put<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    /**
     * Submit the form via a DELETE request.
     */
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    submit<T = any>(method: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    handleErrors(error: AxiosError): void;
    extractErrors(response: AxiosResponse): Record<string, any>;
    handleUploadProgress(event: ProgressEvent): void;
    toFormData(data: Record<string, string | Blob>): FormData;
}
export default Form;
