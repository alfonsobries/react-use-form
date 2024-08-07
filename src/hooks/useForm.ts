import { AxiosInstance } from 'axios';
import { useContext, useRef, useState } from 'react';

import FormContext from '../context/FormContext';
import FormClass, { FormState } from '../form/Form';
import { deepCopy } from '../utils';

export type Form<Data extends Record<string, any> = Record<string, any>> =
  FormClass<Data> & Data & Omit<FormState<Data>, 'data'> & { dirty: boolean };

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

  const originalData = useRef(deepCopy<Data>(data));

  const errorsState = useState({});

  const form = new FormClass(formState, originalData, errorsState);

  // eslint-disable-next-line no-undef
  return new Proxy(form, {
    get(form: FormClass<Data>, attribute: string) {
      if (form.keys().includes(attribute)) {
        return form.getField(attribute);
      }

      if (['progress', 'busy', 'successful'].includes(attribute)) {
        return form.formState[0][attribute as 'progress' | 'busy' | 'successful'];
      }

      if (attribute === 'dirty') {
        return form.isDirty();
      }

      return (form as any)[attribute];
    },
  }) as Form<Data>;
};
