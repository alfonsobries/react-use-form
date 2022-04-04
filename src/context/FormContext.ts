import { AxiosInstance } from 'axios';
import { createContext } from 'react';

const FormContext = createContext<AxiosInstance | undefined>(undefined);

export default FormContext;
