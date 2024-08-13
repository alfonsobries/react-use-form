[![CI](https://github.com/alfonsobries/react-use-form/actions/workflows/test.yaml/badge.svg)](https://github.com/alfonsobries/react-use-form/actions/workflows/test.yaml)

# React-use-form

React hook for handling form states, requests, and validation, compatible with React and React Native.

- ✅ Simple and intuitive API
- ✅ 100% Test coverage
- ✅ Strongly typed with TypeScript
- ✅ Ready for Laravel validation responses
- ✅ Error handling

## Installation

```console
npm install @alfonsobries/react-use-form
```

Or, as an alternative, use `yarn`

```console
yarn add @alfonsobries/react-use-form
```

## Quick usage

1. Import the `useForm` hook

```jsx
import useForm from '@alfonsobries/react-use-form';
```

2. Initialize your form by passing the form state to the hook function. You can use the form attributes directly to read the state and use the form API to manage the values and the errors.

```jsx
function MyComponent() {
  const formState = {
    name: 'Alfonso',
    email: 'alfonso@vexilo.com',
    rememberMe: false,
  };

  const form = useForm(formState);

  const onSubmit = () => {
    // Submit handling
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => form.set('name', e.target.value)}
        />
        {form.errors.has('name') && <span>{form.errors.get('name')}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

3. Use the request methods to send an HTTP request with the form state.

```js
// Submit method (called by the form (see full example above))
const onSubmit = () => {
  // Submit handling
  // you can use `.post`, `.get`, `.delete`, etc.
  form
    .post('https://my-custom-api.test')
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
};
```

## Custom axios instance

If needed, you can pass your custom axios instance as the second parameter of the hook

```ts
const instance = axios.create({
  baseURL: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: { 'X-Custom-Header': 'foobar' },
});

const form = useForm(formState, instance);

// ...
const submitHandler = async () => {
  // Since the custom instance has a baseUrl I can pass a relative path:
  const response = await form.post('relative/path');
};
```

You can also use the included form context to change the axios instance globally

```jsx
// Inside the main file
import { FormContext } from '@alfonsobries/react-use-form';

const instance = axios.create({
  baseURL: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: { 'X-Custom-Header': 'foobar' },
});

function App() {
  return (
    <FormContext.Provider value={instance}>
      <ChildComponent />
    </FormContext.Provider>
  );
}
```

## Request Configuration `^0.3.1`

The `RequestConfig` interface allows you to customize how the form request is made. This interface has two optional properties:

- `requestConfig`: This is an object of type `AxiosRequestConfig` and allows you to pass any configuration options directly to the Axios request, such as headers, parameters, or timeout settings.
- `keepBusyOnSuccess`: This boolean flag, when set to `true`, keeps the form in a busy state even after a successful request. This can be useful in scenarios where you want to prevent user interaction until a follow-up action is completed.

Example usage:

```ts
form.post('/submit', {
  requestConfig: {
    headers: { 'Authorization': 'Bearer my-token' },
    timeout: 5000,
  },
  keepBusyOnSuccess: true,
});
```

## API

### Form API

```ts
const form = new Form({ ... })

/**
 * Indicates if the form is busy making an HTTP request to the server.
 */
form.busy: boolean

/**
 * Indicates if the form HTTP request was successful.
 */
form.successful: boolean

/**
 * The validation errors from the server.
 */
form.errors: Errors

/**
 * The upload progress object.
 */
form.progress: { total: number, loaded: number, percentage: number } | undefined

/**
 * Indicates if the form data has been modified from its original state.
 */
form.dirty: boolean

/**
 * Set the value for the attribute
 */
form.set(field: string, fieldValue: any)

/**
 * Submit the form data via an HTTP request.
 */
form.submit(method: string, url: string, config = {})
form.post|patch|put|delete|get(url: string, config = {})

/**
 * Clear the form errors.
 */
form.clear()

/**
 * Reset the form data.
 */
form.reset()

/**
 * Update the form data.
 */
form.update({ ... })

/**
 * Fill the form data.
 */
form.fill({ ... })

```

### Errors API

```ts
/**
 * Get all the errors.
 */
form.errors.all()

/**
 * Determine if there is an error for the given field.
 */
form.errors.has(field: string): boolean

/**
 * Determine if there are any errors.
 */
form.errors.any(): boolean

/**
 * Get the first error message for the given field.
 */
form.errors.get(field: string): string|undefined

/**
 * Get all the error messages for the given field.
 */
form.errors.getAll(field: string): string[]

/**
 * Get all the errors in a flat array.
 */
form.errors.flatten(): string[]

/**
 * Clear one, some or all error fields.
 */
form.errors.clear(field: string|string[]|undefined)

/**
 * Set the errors object.
 */
form.errors.set(errors = {})

/**
 * Set a specified error message.
 */
form.errors.set(field: string, message: string)

```

## Examples

### React Form (with TypeScript)

```tsx
import React, { FormEventHandler } from 'react';
import useForm from '@alfonsobries/react-use-form';

type ExampleApiResponse = {
  myString: string;
  myNumber: number;
};

function LoginForm() {
  const form: Form = useForm({
    name: 'Alfonso',
    email: 'alfonso@vexilo.com',
    rememberMe: false,
  });

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    form
      .post<ExampleApiResponse>('https://my-custom-api.test')
      .then((response) => {
        // `response.data` is typed as `ExampleApiResponse`
        console.log(response.data.myString.charAt(0));
        console.log(response.data.myNumber.toFixed());
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => form.set('name', e.target.value)}
        />
        {form.errors.has('name') && <span>{form.errors.get('name')}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="text"
          value={form.email}
          onChange={(e) => form.set('email', e.target.value)}
        />
        {form.errors.has('email') && <span>{form.errors.get('email')}</span>}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={form.rememberMe === true}
            onChange={() => form.set('rememberMe', !form.rememberMe)}
          />
          Remember me
        </label>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

export default LoginForm;
```

### React Form (non-typed)

```jsx
import React from 'react';
import useForm from '@alfonsobries/react-use-form';

function LoginForm() {
  const form = useForm({
    name: 'Alfonso',
    email: 'alfonso@vexilo.com',
    rememberMe: false,
  });

  const onSubmit = (e) => {
    e.preventDefault();

    form
      .post('https://my-custom-api.test')
      .then((response) => {
        console.log(response.data.myString.charAt(0));
        console.log(response.data.myNumber.toFixed());
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => form.set('name', e.target.value)}
        />
        {form.errors.has('name') && <span>{form.errors.get('name')}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="text"
          value={form.email}
          onChange={(e) => form.set('email', e.target.value)}
        />
        {form.errors.has('email') && <span>{form.errors.get('email')}</span>}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={form.rememberMe === true}
            onChange={() => form.set('rememberMe', !form.rememberMe)}
          />
          Remember me
        </label>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

export default LoginForm;
```

## Contribute

Did I save you a few hours of work? Consider:

- 💵 [Sponsoring my open source work](https://github.com/sponsors/alfonsobries)
- ⭐ [Nominating me as a GitHub Star](https://stars.github.com/nominate/)
