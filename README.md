[![CI](https://github.com/alfonsobries/react-use-form/actions/workflows/test.yaml/badge.svg)](https://github.com/alfonsobries/react-use-form/actions/workflows/test.yaml)

# React-use-form:

React hook for handling form states, requests, and validation, compatible with React and React Native.

- ✅ 100% Test coverage
- ✅ Strong typed with Typescript
- ✅ Simple and intuitive API
- ✅ Ready for Laravel validation responses

## React Example

```jsx
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
    </form>
  )
}

export default LoginForm
```
