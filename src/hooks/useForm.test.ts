import { act, renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from 'vitest';

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

  it('updates the value of a property', () => {
    const { result } = renderHook(() => useForm(data));

    act(() => {
      result.current.set('name', 'Saida');
    });

    expect(result.current.name).toBe('Saida');
    expect(result.current.email).toBe('alfonso@vexilo.com');
  });
});
