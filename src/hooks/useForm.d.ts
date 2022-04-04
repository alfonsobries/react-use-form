import Form from '../form/Form';
export declare const useForm: <Data extends Record<string, any>>(data: Data) => Form<Data> & Data;
