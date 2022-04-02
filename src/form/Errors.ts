import React from 'react';

class Errors {
  state: [
    Record<string, unknown>,
    React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
  ];

  constructor(
    state: [
      Record<string, unknown>,
      React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
    ],
  ) {
    this.state = state;
  }
}

export default Errors;
