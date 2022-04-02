import React from 'react';

import { arrayWrap } from '../utils';

class Errors {
  state: Record<string, string[]>;
  setState: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;

  constructor([state, setState]: [
    Record<string, string[]>,
    React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
  ]) {
    this.state = state;
    this.setState = setState;
  }

  set(errorsOrField: string | Record<string, string[]>, fieldMessages?: any) {
    if (typeof errorsOrField === 'object') {
      this.setState(errorsOrField);
    } else {
      this.setState({ ...this.state, [errorsOrField]: arrayWrap(fieldMessages) });
    }
  }

  has(field: string): boolean {
    return this.state[field] !== undefined;
  }

  all() {
    return this.state;
  }
}

export default Errors;
