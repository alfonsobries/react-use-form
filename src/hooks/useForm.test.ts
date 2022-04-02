import { act, renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from 'vitest';

import Errors from '../form/Errors';
import { useForm } from './useForm';

describe('useForm', () => {
  const data = {
    name: 'Alfonso',
    email: 'alfonso@vexilo.com',
    password: 'secret',
    remember: true,
  };

  it('should add the form properties', () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm(data));

    Object.entries(data).forEach(([key, value]) => {
      expect(form[key]).toBe(value);
    });
  });

  it('should get the form data', () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm(data));

    expect(form.data()).toEqual(data);
  });

  it('updates the value of a property', () => {
    const { result } = renderHook(() => useForm(data));

    act(() => {
      result.current.set('name', 'Saida');
    });

    expect(result.current.name).toBe('Saida');
    expect(result.current.email).toBe('alfonso@vexilo.com');
  });

  it('fills the form data', () => {
    const { result } = renderHook(() => useForm(data));
    const dataToFill = {
      name: 'Saida',
      email: 'saida@gmail.com',
    };

    act(() => {
      result.current.fill(dataToFill);
    });

    expect(result.current.data()).toEqual({
      ...data,
      ...dataToFill,
    });
  });

  it('reset the form data', () => {
    const { result } = renderHook(() => useForm(data));

    act(() => {
      result.current.fill({
        name: 'Saida',
        email: 'saida@gmail.com',
      });

      result.current.reset();
    });

    expect(result.current.data()).toEqual(data);
  });

  it('has errors', () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm(data));

    expect(form.errors).toBeInstanceOf(Errors);
  });

  describe('Errors', () => {
    const errors = {
      name: ['Name is required'],
      email: ['Email is not valid', 'Email is required'],
    };

    it('can set errors', () => {
      const { result } = renderHook(() => useForm(data));

      act(() => {
        result.current.errors.set(errors);
      });

      expect(result.current.errors.all()).toEqual(errors);
    });

    it('can set a single error', () => {
      const { result } = renderHook(() => useForm(data));

      act(() => {
        result.current.errors.set(errors);
      });

      act(() => {
        result.current.errors.set('password', 'Password is required');
      });

      expect(result.current.errors.all()).toEqual({
        ...errors,
        password: ['Password is required'],
      });
    });

    it('can determine if a field has an error', () => {
      const { result } = renderHook(() => useForm(data));

      act(() => {
        result.current.errors.set(errors);
      });

      expect(result.current.errors.has('email')).toBe(true);
      expect(result.current.errors.has('address')).toBe(false);
    });
  });
});
