import { AxiosInstance } from 'axios';
import { useContext, useState } from 'react';

import FormContext from '../context/FormContext';
import FormClass, { FormState } from '../form/Form';

export type Form<Data extends Record<string, any> = Record<string, any>> =
  FormClass<Data> & Data & Omit<FormState<Data>, 'data'>;

export const useForm = <Data extends Record<string, any> = Record<string, any>>(
  data: Data,
  axiosInstance?: AxiosInstance,
): Form<Data> => {
  const axios = useContext(FormContext) || axiosInstance;

  if (axios !== undefined) {
    FormClass.axios = axios;
  }

  const formState = useState<FormState<Data>>({
    data,
    busy: false,
    successful: false,
    progress: undefined,
  });

  const errorsState = useState({});
  const form = new FormClass(formState, errorsState);

  // eslint-disable-next-line no-undef
  return new Proxy(form, {
    get(form: FormClass<Data>, attribute: string) {
      if (form.keys().includes(attribute)) {
        return form.getField(attribute);
      }

      if (['progress', 'busy', 'successful'].includes(attribute)) {
        return form.formState[0][attribute as 'progress' | 'busy' | 'successful'];
      }

      return (form as any)[attribute];
    },
  }) as Form<Data>;
};
