// import { useCallback, useState } from 'react';

import { useCallback, useReducer } from 'react';

function reducer(state, { type, payload }) {
  switch (type) {
    case 'set':
      return { ...state, ...payload };
    default:
      throw new Error();
  }
}

export const useForm = (data: Record<string, unknown>) => {
  const [state, dispatch] = useReducer(reducer, data);

  const [errorsState, errorsDispatch] = useReducer(reducer, {});

  const set = useCallback(
    (prop: string, value: any) => {
      dispatch({
        type: 'set',
        payload: {
          [prop]: value,
        },
      });

      return value;
    },
    [dispatch],
  );

  const errors = new Proxy(errorsState, {
    get(target, prop) {},
  });

  return new Proxy(state, {
    get(state, attribute: string) {
      if (attribute === 'set') {
        return set;
      }

      if (attribute === 'errors') {
        return errors;
      }

      return state[attribute];
    },
  });
};
