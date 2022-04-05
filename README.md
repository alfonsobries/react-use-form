
[![CI](https://github.com/alfonsobries/react-use-form/actions/workflows/test.yaml/badge.svg)](https://github.com/alfonsobries/react-use-form/actions/workflows/test.yaml)

# React-use-form:

React hook for handling form states, requests, and validation, compatible with React and React Native.

- ✅ Simple and intuitive API
- ✅ 100% Test coverage
- ✅ Strong typed with Typescript
- ✅ Ready for Laravel validation responses

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

2. Initialize your form by passing the form state to the hook function. You can use the form.attributes directly to read the state and use the form API to manage the values and the errors.

```jsx
function MyComponent()  {
  const formState = {
    name: 'Alfonso',
    email: 'alfonso@vexilo.com',
    rememberMe: false,
  }
  
  const form = useForm(formState)

  const onSubmit = () => {
    // Submit handling
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Name</label>
        <input type="text" value={form.name} onChange={e => form.set('name', e.target.value)} />
        {form.errors.has('name') && <span>{ form.errors.get('name') }</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  )

}
```

3. Use the request methods to send an HTTP request with the form state.

```js
// Submit method (called by the form (see full example above))
const onSubmit = () => {
  // Submit handling
  // you can use `.post`, `.get`, `.delete`, etc.
  form.post('https://my-custom-api.test')
      .then((response) => {
        console.log(response.data)
      }).catch(error => {
        console.error(error)
      })
}
```

## Examples
### React Form (with Typescript)

```tsx
import React, { FormEventHandler } from 'react'
import useForm from '@alfonsobries/react-use-form';

type ExampleApiResponse = {
  myString: string
  myNumber: number
}

function LoginForm() {
  const form = useForm({
    name: 'Alfonso',
    email: 'alfonso@vexilo.com',
    rememberMe: false,
  })

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    form.post<ExampleApiResponse>('https://my-custom-api.test')
      .then((response) => {
        // `response.data` is typed as `ExampleApiResponse`
        console.log(response.data.myString.charAt(0))
        console.log(response.data.myNumber.toFixed())
      }).catch(error => {
        console.error(error)
      })
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Name</label>
        <input type="text" value={form.name} onChange={e => form.set('name', e.target.value)} />
        {form.errors.has('name') && <span>{ form.errors.get('name') }</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="text" value={form.email} onChange={e => form.set('email', e.target.value)} />
        {form.errors.has('email') && <span>{ form.errors.get('email') }</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" checked={form.rememberMe === true} onChange={() => form.set('rememberMe', !form.rememberMe)} />

          Remember me
        </label>
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}

export default LoginForm
```

### React Form (non typed)

```jsx
import React from 'react'
import useForm from '@alfonsobries/react-use-form';

function LoginForm() {
  const form = useForm({
    name: 'Alfonso',
    email: 'alfonso@vexilo.com',
    rememberMe: false,
  })

  const onSubmit = (e) => {
    e.preventDefault();

    form.post('https://my-custom-api.test')
      .then((response) => {
        console.log(response.data.myString.charAt(0))
        console.log(response.data.myNumber.toFixed())
      }).catch(error => {
        console.error(error)
      })
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Name</label>
        <input type="text" value={form.name} onChange={e => form.set('name', e.target.value)} />
        {form.errors.has('name') && <span>{ form.errors.get('name') }</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="text" value={form.email} onChange={e => form.set('email', e.target.value)} />
        {form.errors.has('email') && <span>{ form.errors.get('email') }</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" checked={form.rememberMe === true} onChange={() => form.set('rememberMe', !form.rememberMe)} />

          Remember me
        </label>
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}

export default LoginForm
```
