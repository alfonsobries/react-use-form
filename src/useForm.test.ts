import { act, renderHook } from '@testing-library/react-hooks'
import { useForm } from './useForm'

describe('useForm', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useForm())
    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(1)
  })
})