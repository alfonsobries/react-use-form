import { AxiosInstance } from 'axios';
import FormClass, { FormState } from '../form/Form';
export type Form<Data extends Record<string, any> = Record<string, any>> = FormClass<Data> & Data & Omit<FormState<Data>, 'data'>;
export declare const useForm: <Data extends Record<string, any> = Record<string, any>>(data: Data, axiosInstance?: AxiosInstance) => Form<Data>;
