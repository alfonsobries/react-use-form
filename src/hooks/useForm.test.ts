import { act, renderHook } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Errors from '../form/Errors';
import Form from '../form/Form';
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
      expect((form as any)[key]).toBe(value);
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

  describe('Form requests', () => {
    const users = [
      {
        id: 1,
        name: 'Saida',
        email: 'saida@gmail.com',
      },
      {
        id: 2,
        name: 'Alfonso',
        email: 'alfonso@vexilo.com',
      },
    ];
    const apiBase = 'https://api.test/users';

    // This sets the mock adapter on the default instance
    const mock = new MockAdapter(axios);

    afterEach(() => mock.resetHandlers());

    it('can make a GET request', async () => {
      mock.onGet(apiBase).reply(200, users);

      const {
        result: { current: form },
      } = renderHook(() => useForm(data));

      const response = await form.submit('GET', apiBase);

      expect(response.data).toEqual(users);
    });

    it('can make a POST request', async () => {
      mock.onPost(apiBase).reply((config) => {
        return [200, JSON.parse(config.data)];
      });

      const {
        result: { current: form },
      } = renderHook(() => useForm(data));

      const response = await form.submit('POST', apiBase);

      expect(response.data).toEqual(data);
    });

    it('can make a get request and add custom params', async () => {
      mock.onGet(apiBase).reply((config) => {
        return [200, config.params];
      });

      const {
        result: { current: form },
      } = renderHook(() => useForm(data));

      const response = await form.submit('get', apiBase, {
        params: {
          foo: 'bar',
        },
      });

      expect(response.data).toEqual({
        ...data,
        foo: 'bar',
      });
    });

    it('can make a post request and add custom data', async () => {
      mock.onPost(apiBase).reply((config) => {
        return [200, JSON.parse(config.data)];
      });

      const {
        result: { current: form },
      } = renderHook(() => useForm(data));

      const response = await form.submit('POST', apiBase, {
        data: {
          foo: 'bar',
        },
      });

      expect(response.data).toEqual({
        ...data,
        foo: 'bar',
      });
    });

    it.each(['get', 'post', 'put', 'patch', 'delete'])(
      "can make a request with method '%s'",
      async (method) => {
        mock.onAny(apiBase).reply((config) => {
          return [
            200,
            {
              method,
              data: method === 'get' ? config.params : JSON.parse(config.data),
            },
          ];
        });

        const {
          result: { current: form },
        } = renderHook(() => useForm(data));

        const response = await (form as any)[method](apiBase);

        expect(response.data.method).toEqual(method);

        expect(response.data.data).toEqual(data);
      },
    );

    it('transform data object to FormData', async () => {
      const dataWithObject = {
        ...data,
        photo: new File([new Uint8Array(10)], 'photo.jpg', { type: 'image/png' }),
      };

      const {
        result: { current: form },
      } = renderHook(() => useForm(dataWithObject));

      mock.onPut(apiBase).reply((config) => {
        expect(config.data).toBeInstanceOf(FormData);
        expect(config.data.has('photo')).toBeTruthy();
        expect(config.data.has('name')).toBeTruthy();

        return [200, {}];
      });

      await form.submit('put', apiBase);
    });

    it('transform file list to FormData', async () => {
      const getFileList = () => {
        const blob = new Blob([''], { type: 'text/html' }) as any;
        blob['lastModifiedDate'] = '';
        blob['name'] = 'filename';
        const file = <File>blob;
        const files = [file, file];

        const fileList = Object.assign(Object.create(FileList.prototype), {
          0: files[0],
          1: files[1],
          item: (index: number) => files[index],
        }) as unknown as FileList;

        vi.spyOn(fileList, 'length', 'get').mockReturnValue(2);

        return fileList;
      };

      const dataWithObject = {
        ...data,
        photos: getFileList(),
      };

      const {
        result: { current: form },
      } = renderHook(() => useForm(dataWithObject));

      mock.onPut(apiBase).reply((config) => {
        expect(config.data).toBeInstanceOf(FormData);
        expect(config.data.has('photos')).toBeTruthy();
        expect(config.data.has('name')).toBeTruthy();

        return [200, {}];
      });

      await form.submit('put', apiBase);
    });

    describe('Request errors', () => {
      it('stores errors from the server', async () => {
        mock.onPost(apiBase).reply(422, {
          name: ['Value is required'],
        });

        const { result } = renderHook(() => useForm(data));

        try {
          await result.current.post(apiBase);
        } catch (e) {
          // do nothing
        }

        expect(result.current.errors.any()).toBeTruthy();
        expect(result.current.busy).toBeFalsy();
        expect(result.current.successful).toBeFalsy();
      });

      it('stores errors from the server if they come in the `errors` property', async () => {
        mock.onPost(apiBase).reply(422, {
          errors: {
            name: ['Value is required'],
          },
        });

        const { result } = renderHook(() => useForm(data));

        try {
          await result.current.post(apiBase);
        } catch (e) {
          // do nothing
        }

        expect(result.current.errors.any()).toBeTruthy();
        expect(result.current.busy).toBeFalsy();
        expect(result.current.successful).toBeFalsy();
      });

      it('stores a default error if response doesnt have data', async () => {
        mock.onPost(apiBase).reply(422);

        const { result } = renderHook(() => useForm(data));

        try {
          await result.current.post(apiBase);
        } catch (e) {
          // do nothing
        }

        expect(result.current.errors.get('error')).toBe(Form.errorMessage);
        expect(result.current.busy).toBeFalsy();
        expect(result.current.successful).toBeFalsy();
      });

      it('stores a error message is set', async () => {
        mock.onPost(apiBase).reply(422, {
          message: 'Oops!',
        });

        const { result } = renderHook(() => useForm(data));

        try {
          await result.current.post(apiBase);
        } catch (e) {
          // do nothing
        }

        expect(result.current.errors.get('error')).toBe('Oops!');
        expect(result.current.busy).toBeFalsy();
        expect(result.current.successful).toBeFalsy();
      });
    });

    describe('Form progress', () => {
      it('handle upload progress', async () => {
        mock.onPost(apiBase).reply((config) => {
          const total = 1024; // mocked file size
          const progress = 0.4;
          if (config.onUploadProgress) {
            config.onUploadProgress({
              loaded: total * progress,
              total,
              bytes: total,
              lengthComputable: true,
            });
          }
          return [200, null];
        });

        const { result } = renderHook(() => useForm(data));

        const handleUploadProgressSpy = vi.spyOn(result.current, 'handleUploadProgress');

        await result.current.submit('POST', apiBase);

        expect(handleUploadProgressSpy).toHaveBeenCalledWith({
          loaded: 409.6,
          total: 1024,
        });

        handleUploadProgressSpy.mockRestore();
      });

      it('stores upload progress', async () => {
        mock.onPost(apiBase).reply(async (config) => {
          const total = 1024; // mocked file size
          const progress = 0.4;

          if (config.onUploadProgress) {
            config.onUploadProgress({
              loaded: total * progress,
              total,
              bytes: total,
              lengthComputable: true,
            });
          }

          expect(result.current.progress).toEqual({
            total: 1024,
            loaded: 409.6,
            percentage: Math.round((409.6 * 100) / 1024),
          });

          return [200, null];
        });

        const { result } = renderHook(() => useForm(data));

        await result.current.submit('POST', apiBase);

        expect(result.current.progress).toBeUndefined();
      });
    });

    describe('Axios instance', () => {
      it('accepts a custom axios instance', () => {
        const axiosInstance = axios.create({
          baseURL: 'http://localhost:3000',
        });

        const { result } = renderHook(() => useForm({}, axiosInstance));

        mock.onPost('http://localhost:3000/users').reply(async (config) => {
          expect(config.baseURL).toBe('http://localhost:3000');
          return [200, {}];
        });

        result.current.post('/users');
      });
    });
  });
});
