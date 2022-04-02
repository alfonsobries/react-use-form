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

  it('should get the form data for a complex object', () => {
    const complexData = {
      user: {
        name: 'Alfonso',
        email: 'alfonso@vexilo.com',
      },
      tags: ['javascript', 'typescript'],
      posts: [
        {
          title: 'Hello world',
          content: 'This is my first post',
        },
        {
          title: 'Hello world 2',
          content: 'This is my second post',
        },
      ],
      active: true,
    };

    const {
      result: { current: form },
    } = renderHook(() => useForm(complexData));

    expect(form.data()).toEqual(complexData);
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

    it('can set a single error as an array', () => {
      const { result } = renderHook(() => useForm(data));

      act(() => {
        result.current.errors.set(errors);
      });

      act(() => {
        result.current.errors.set('password', ['Password is required']);
      });

      expect(result.current.errors.all()).toEqual({
        ...errors,
        password: ['Password is required'],
      });
    });

    it('can get first error for a single field', () => {
      const { result } = renderHook(() => useForm(data));

      act(() => {
        result.current.errors.set(errors);
      });

      expect(result.current.errors.get('email')).toBe('Email is not valid');
    });

    it('gets undefined if no error for a single field', () => {
      const { result } = renderHook(() => useForm(data));

      act(() => {
        result.current.errors.set(errors);
      });

      expect(result.current.errors.get('address')).toBeUndefined();
    });

    it('can determine if a field has an error', () => {
      const { result } = renderHook(() => useForm(data));

      act(() => {
        result.current.errors.set(errors);
      });

      expect(result.current.errors.has('email')).toBe(true);
      expect(result.current.errors.has('address')).toBe(false);
    });

    it('can determine if has any error', () => {
      const { result } = renderHook(() => useForm(data));

      expect(result.current.errors.any()).toBe(false);

      act(() => {
        result.current.errors.set(errors);
      });

      expect(result.current.errors.any()).toBe(true);
    });

    it('can get all the errors', () => {
      const { result } = renderHook(() => useForm(data));

      expect(result.current.errors.any()).toBe(false);

      act(() => {
        result.current.errors.set(errors);
      });

      expect(result.current.errors.all()).toEqual(errors);
    });

    it('can get all the errors in a flat array', () => {
      const { result } = renderHook(() => useForm(data));

      expect(result.current.errors.any()).toBe(false);

      act(() => {
        result.current.errors.set(errors);
      });

      expect(result.current.errors.flatten()).toEqual([
        'Name is required',
        'Email is not valid',
        'Email is required',
      ]);
    });

    it('can clear all the errors', () => {
      const { result } = renderHook(() => useForm(data));

      expect(result.current.errors.any()).toBe(false);

      act(() => {
        result.current.errors.set(errors);
      });

      act(() => {
        result.current.errors.clear();
      });

      expect(result.current.errors.all()).toEqual({});
    });

    it('can clear a single error', () => {
      const { result } = renderHook(() => useForm(data));

      expect(result.current.errors.any()).toBe(false);

      act(() => {
        result.current.errors.set(errors);
      });

      act(() => {
        result.current.errors.clear('email');
      });

      expect(result.current.errors.all()).toEqual({
        name: ['Name is required'],
      });
    });
  });
});
