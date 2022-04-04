import { fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import FormContext from '../context/FormContext';
import { useForm } from '../hooks/useForm';

const ComponentProvider = ({ children }: { children: React.ReactNode }) => {
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
  });

  return <FormContext.Provider value={axiosInstance}>{children}</FormContext.Provider>;
};

const Component = () => {
  const form = useForm({
    name: 'Alfonso',
  });

  const onClick = async () => {
    await form.post('/users');
  };

  return (
    <button data-testid="Button" onClick={onClick}>
      Click me
    </button>
  );
};

describe('Form Context', () => {
  const mock = new MockAdapter(axios);

  afterEach(() => mock.resetHandlers());

  it('accepts a custom axios instance as context', () => {
    mock.onPost('http://localhost:3000/users').reply(async (config) => {
      expect(config.baseURL).toBe('http://localhost:3000');
      return [200, {}];
    });

    render(
      <ComponentProvider>
        <Component />
      </ComponentProvider>,
    );

    fireEvent(
      screen.getByTestId('Button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    );
  });
});
