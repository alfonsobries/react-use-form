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

  set(errorsOrField: string | Record<string, string[]>, fieldMessages?: any): void {
    if (typeof errorsOrField === 'object') {
      this.setState(errorsOrField);
    } else {
      this.setState({ ...this.state, [errorsOrField]: arrayWrap(fieldMessages) });
    }
  }

  get(field: string): string | undefined {
    if (this.state[field] !== undefined) {
      return this.state[field][0];
    }

    return undefined;
  }

  has(field: string): boolean {
    return this.state[field] !== undefined;
  }

  any(): boolean {
    return Object.keys(this.state).length > 0;
  }

  all(): Record<string, string[]> {
    return this.state;
  }

  flatten(): string[] {
    return Object.values(this.state).reduce(
      (errors, fieldErrors) => [...errors, ...fieldErrors],
      [],
    );
  }

  clear(field?: string): void {
    if (field === undefined) {
      this.setState({});
      return;
    }

    const newState = { ...this.state };
    delete newState[field];
    this.setState(newState);
  }
}

export default Errors;
