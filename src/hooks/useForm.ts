// import { useCallback, useState } from 'react';

import Form from '../form/Form';

export const useForm = (data: Record<string, unknown>) => {
  const form = new Form(data);

  return form;
};
