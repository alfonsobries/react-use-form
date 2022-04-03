import { useState } from 'react';

import Form, { FormState } from '../form/Form';

export const useForm = (data: Record<string, unknown>) => {
  const formState = useState<FormState>({
    data,
    busy: false,
    successful: false,
    progress: undefined,
  });

  const errorsState = useState({});
  const form = new Form(formState, errorsState);

  // eslint-disable-next-line no-undef
  return new Proxy(form, {
    get(form: Form, attribute: string) {
      if (form.keys().includes(attribute)) {
        return form.getField(attribute);
      }

      if (['progress', 'busy', 'successful'].includes(attribute)) {
        return form.formState[0][attribute];
      }

      return form[attribute];
    },
  });
};
