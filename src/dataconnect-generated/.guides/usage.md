# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useInsertUser, useUpdateUser, useDeleteUser, useGetUser, useListUsers, useInsertProfile, useUpdateProfile, useDeleteProfile, useGetProfile, useListProfiles } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useInsertUser();

const { data, isPending, isSuccess, isError, error } = useUpdateUser();

const { data, isPending, isSuccess, isError, error } = useDeleteUser();

const { data, isPending, isSuccess, isError, error } = useGetUser();

const { data, isPending, isSuccess, isError, error } = useListUsers();

const { data, isPending, isSuccess, isError, error } = useInsertProfile();

const { data, isPending, isSuccess, isError, error } = useUpdateProfile();

const { data, isPending, isSuccess, isError, error } = useDeleteProfile();

const { data, isPending, isSuccess, isError, error } = useGetProfile();

const { data, isPending, isSuccess, isError, error } = useListProfiles();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { insertUser, updateUser, deleteUser, getUser, listUsers, insertProfile, updateProfile, deleteProfile, getProfile, listProfiles } from '@dataconnect/generated';


// Operation InsertUser: 
const { data } = await InsertUser(dataConnect);

// Operation UpdateUser: 
const { data } = await UpdateUser(dataConnect);

// Operation DeleteUser: 
const { data } = await DeleteUser(dataConnect);

// Operation GetUser: 
const { data } = await GetUser(dataConnect);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation InsertProfile: 
const { data } = await InsertProfile(dataConnect);

// Operation UpdateProfile: 
const { data } = await UpdateProfile(dataConnect);

// Operation DeleteProfile: 
const { data } = await DeleteProfile(dataConnect);

// Operation GetProfile: 
const { data } = await GetProfile(dataConnect);

// Operation ListProfiles: 
const { data } = await ListProfiles(dataConnect);


```