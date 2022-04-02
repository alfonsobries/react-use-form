import React from 'react';

import { deepCopy } from '../utils';
import Errors from './Errors';

class Form {
  // eslint-disable-next-line no-undef
  [key: string]: any;

  originalData: Record<string, any> = {};

  dataState: [
    Record<string, unknown>,
    React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
  ];

  errors: Errors;

  constructor(
    dataState: [
      Record<string, unknown>,
      React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
    ],
    errorsState: [
      Record<string, string[]>,
      React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
    ],
  ) {
    this.dataState = dataState;
    this.errors = new Errors(errorsState);
    this.originalData = deepCopy(dataState[0]);
  }

  get(key: string): any {
    return this.dataState[0][key];
  }

  set(key: string, value: any): void {
    this.dataState[1]({ ...this.dataState[0], [key]: value });
  }

  keys(): string[] {
    return Object.keys(this.dataState[0]);
  }

  fill(data: Record<string, any> = {}) {
    this.dataState[1]({ ...this.dataState[0], ...data });
  }

  data(): Record<string, any> {
    return this.keys().reduce((data, key) => ({ ...data, [key]: this.get(key) }), {});
  }

  reset(): void {
    this.dataState[1](this.originalData);
  }
}

export default Form;
