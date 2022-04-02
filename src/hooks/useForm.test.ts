import { act, renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from 'vitest';

import { useForm } from './useForm';

describe('useForm', () => {
  it('should add the form properties', async () => {
    const data = {
      name: 'Alfonso',
      email: 'alfonso@vexilo.com',
      password: 'secret',
      remember: true,
    };

    const {
      result: { current: form },
    } = await renderHook(() => useForm(data));

    // act(() => {
    //   result.current.increment()
    // })

    Object.entries(data).forEach(([key, value]) => {
      expect(form[key]).toBe(value);
    });
  });
});
