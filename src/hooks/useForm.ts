import { useState } from 'react';

import Form from '../form/Form';

export const useForm = (data: Record<string, unknown>) => {
  const dataState = useState(data);
  const errorsState = useState({});
  const form = new Form(dataState, errorsState);

  // eslint-disable-next-line no-undef
  return new Proxy(form, {
    get(form: Form, attribute: string) {
      if (form.keys().includes(attribute)) {
        return form.getField(attribute);
      }

      return form[attribute];
    },
  });
};
