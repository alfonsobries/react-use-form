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
      this.setState(() => errorsOrField);
    } else {
      this.setState((state) => ({
        ...state,
        [errorsOrField]: arrayWrap(fieldMessages),
      }));
    }
  }

  get(field: string): string | undefined {
    if (this.state[field] !== undefined) {
      return this.state[field][0];
    }

    return undefined;
  }

  getAll(field: string): string[] | undefined {
    if (this.state[field] !== undefined) {
      return this.state[field];
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

  clear(fieldOrFields?: string | string[]): void {
    if (fieldOrFields === undefined) {
      this.setState({});
      return;
    }

    this.setState((state) => {
      const newState = { ...state };
      const fields = arrayWrap(fieldOrFields);

      fields.forEach((field) => {
        delete newState[field];
      });

      return newState;
    });
  }
}

export default Errors;
