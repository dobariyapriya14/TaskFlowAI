# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUser*](#getuser)
  - [*ListUsers*](#listusers)
  - [*GetProfile*](#getprofile)
  - [*ListProfiles*](#listprofiles)
  - [*GetUserRole*](#getuserrole)
  - [*ListUserRoles*](#listuserroles)
  - [*GetUserLogs*](#getuserlogs)
  - [*ListUserLogs*](#listuserlogs)
  - [*GetSubscription*](#getsubscription)
  - [*ListSubscriptions*](#listsubscriptions)
- [**Mutations**](#mutations)
  - [*InsertUser*](#insertuser)
  - [*UpdateUser*](#updateuser)
  - [*DeleteUser*](#deleteuser)
  - [*InsertProfile*](#insertprofile)
  - [*UpdateProfile*](#updateprofile)
  - [*DeleteProfile*](#deleteprofile)
  - [*InsertUserRole*](#insertuserrole)
  - [*UpdateUserRole*](#updateuserrole)
  - [*DeleteUserRole*](#deleteuserrole)
  - [*InsertUserLog*](#insertuserlog)
  - [*UpdateUserLog*](#updateuserlog)
  - [*DeleteUserLog*](#deleteuserlog)
  - [*InsertSubscription*](#insertsubscription)
  - [*UpdateSubscription*](#updatesubscription)
  - [*DeleteSubscription*](#deletesubscription)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUser(options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserData, undefined>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface GetUserRef {
  ...
  (dc: DataConnect): QueryRef<GetUserData, undefined>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query has no variables.
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserData {
  user?: {
    email: string;
    displayName?: string | null;
    isActive?: boolean | null;
  };
}
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser } from '@dataconnect/generated';


// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef } from '@dataconnect/generated';


// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUsersData {
  users: ({
    id: UUIDString;
    email: string;
    displayName?: string | null;
  } & User_Key)[];
}
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetProfile
You can execute the `GetProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getProfile(options?: ExecuteQueryOptions): QueryPromise<GetProfileData, undefined>;

interface GetProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetProfileData, undefined>;
}
export const getProfileRef: GetProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetProfileData, undefined>;

interface GetProfileRef {
  ...
  (dc: DataConnect): QueryRef<GetProfileData, undefined>;
}
export const getProfileRef: GetProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProfileRef:
```typescript
const name = getProfileRef.operationName;
console.log(name);
```

### Variables
The `GetProfile` query has no variables.
### Return Type
Recall that executing the `GetProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProfileData {
  profiles: ({
    bio: string;
    timeZone: string;
    avatarUrl?: string | null;
  })[];
}
```
### Using `GetProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProfile } from '@dataconnect/generated';


// Call the `getProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProfile(dataConnect);

console.log(data.profiles);

// Or, you can use the `Promise` API.
getProfile().then((response) => {
  const data = response.data;
  console.log(data.profiles);
});
```

### Using `GetProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProfileRef } from '@dataconnect/generated';


// Call the `getProfileRef()` function to get a reference to the query.
const ref = getProfileRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProfileRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.profiles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.profiles);
});
```

## ListProfiles
You can execute the `ListProfiles` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listProfiles(options?: ExecuteQueryOptions): QueryPromise<ListProfilesData, undefined>;

interface ListProfilesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProfilesData, undefined>;
}
export const listProfilesRef: ListProfilesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProfiles(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProfilesData, undefined>;

interface ListProfilesRef {
  ...
  (dc: DataConnect): QueryRef<ListProfilesData, undefined>;
}
export const listProfilesRef: ListProfilesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProfilesRef:
```typescript
const name = listProfilesRef.operationName;
console.log(name);
```

### Variables
The `ListProfiles` query has no variables.
### Return Type
Recall that executing the `ListProfiles` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProfilesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListProfilesData {
  profiles: ({
    bio: string;
    timeZone: string;
  })[];
}
```
### Using `ListProfiles`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProfiles } from '@dataconnect/generated';


// Call the `listProfiles()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProfiles();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProfiles(dataConnect);

console.log(data.profiles);

// Or, you can use the `Promise` API.
listProfiles().then((response) => {
  const data = response.data;
  console.log(data.profiles);
});
```

### Using `ListProfiles`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProfilesRef } from '@dataconnect/generated';


// Call the `listProfilesRef()` function to get a reference to the query.
const ref = listProfilesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProfilesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.profiles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.profiles);
});
```

## GetUserRole
You can execute the `GetUserRole` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserRole(options?: ExecuteQueryOptions): QueryPromise<GetUserRoleData, undefined>;

interface GetUserRoleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserRoleData, undefined>;
}
export const getUserRoleRef: GetUserRoleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserRole(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserRoleData, undefined>;

interface GetUserRoleRef {
  ...
  (dc: DataConnect): QueryRef<GetUserRoleData, undefined>;
}
export const getUserRoleRef: GetUserRoleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRoleRef:
```typescript
const name = getUserRoleRef.operationName;
console.log(name);
```

### Variables
The `GetUserRole` query has no variables.
### Return Type
Recall that executing the `GetUserRole` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserRoleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserRoleData {
  userRoles: ({
    roleName: string;
    assignedAt?: TimestampString | null;
  })[];
}
```
### Using `GetUserRole`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserRole } from '@dataconnect/generated';


// Call the `getUserRole()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserRole();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserRole(dataConnect);

console.log(data.userRoles);

// Or, you can use the `Promise` API.
getUserRole().then((response) => {
  const data = response.data;
  console.log(data.userRoles);
});
```

### Using `GetUserRole`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRoleRef } from '@dataconnect/generated';


// Call the `getUserRoleRef()` function to get a reference to the query.
const ref = getUserRoleRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRoleRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userRoles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userRoles);
});
```

## ListUserRoles
You can execute the `ListUserRoles` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUserRoles(options?: ExecuteQueryOptions): QueryPromise<ListUserRolesData, undefined>;

interface ListUserRolesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserRolesData, undefined>;
}
export const listUserRolesRef: ListUserRolesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUserRoles(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUserRolesData, undefined>;

interface ListUserRolesRef {
  ...
  (dc: DataConnect): QueryRef<ListUserRolesData, undefined>;
}
export const listUserRolesRef: ListUserRolesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUserRolesRef:
```typescript
const name = listUserRolesRef.operationName;
console.log(name);
```

### Variables
The `ListUserRoles` query has no variables.
### Return Type
Recall that executing the `ListUserRoles` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUserRolesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUserRolesData {
  userRoles: ({
    roleName: string;
  })[];
}
```
### Using `ListUserRoles`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUserRoles } from '@dataconnect/generated';


// Call the `listUserRoles()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUserRoles();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUserRoles(dataConnect);

console.log(data.userRoles);

// Or, you can use the `Promise` API.
listUserRoles().then((response) => {
  const data = response.data;
  console.log(data.userRoles);
});
```

### Using `ListUserRoles`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUserRolesRef } from '@dataconnect/generated';


// Call the `listUserRolesRef()` function to get a reference to the query.
const ref = listUserRolesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUserRolesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userRoles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userRoles);
});
```

## GetUserLogs
You can execute the `GetUserLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserLogs(options?: ExecuteQueryOptions): QueryPromise<GetUserLogsData, undefined>;

interface GetUserLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserLogsData, undefined>;
}
export const getUserLogsRef: GetUserLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserLogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserLogsData, undefined>;

interface GetUserLogsRef {
  ...
  (dc: DataConnect): QueryRef<GetUserLogsData, undefined>;
}
export const getUserLogsRef: GetUserLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserLogsRef:
```typescript
const name = getUserLogsRef.operationName;
console.log(name);
```

### Variables
The `GetUserLogs` query has no variables.
### Return Type
Recall that executing the `GetUserLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserLogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserLogsData {
  userLogs: ({
    actionType: string;
    timestamp: TimestampString;
    metadata?: string | null;
  })[];
}
```
### Using `GetUserLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserLogs } from '@dataconnect/generated';


// Call the `getUserLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserLogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserLogs(dataConnect);

console.log(data.userLogs);

// Or, you can use the `Promise` API.
getUserLogs().then((response) => {
  const data = response.data;
  console.log(data.userLogs);
});
```

### Using `GetUserLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserLogsRef } from '@dataconnect/generated';


// Call the `getUserLogsRef()` function to get a reference to the query.
const ref = getUserLogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserLogsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userLogs);
});
```

## ListUserLogs
You can execute the `ListUserLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUserLogs(options?: ExecuteQueryOptions): QueryPromise<ListUserLogsData, undefined>;

interface ListUserLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserLogsData, undefined>;
}
export const listUserLogsRef: ListUserLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUserLogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUserLogsData, undefined>;

interface ListUserLogsRef {
  ...
  (dc: DataConnect): QueryRef<ListUserLogsData, undefined>;
}
export const listUserLogsRef: ListUserLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUserLogsRef:
```typescript
const name = listUserLogsRef.operationName;
console.log(name);
```

### Variables
The `ListUserLogs` query has no variables.
### Return Type
Recall that executing the `ListUserLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUserLogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUserLogsData {
  userLogs: ({
    actionType: string;
  })[];
}
```
### Using `ListUserLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUserLogs } from '@dataconnect/generated';


// Call the `listUserLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUserLogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUserLogs(dataConnect);

console.log(data.userLogs);

// Or, you can use the `Promise` API.
listUserLogs().then((response) => {
  const data = response.data;
  console.log(data.userLogs);
});
```

### Using `ListUserLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUserLogsRef } from '@dataconnect/generated';


// Call the `listUserLogsRef()` function to get a reference to the query.
const ref = listUserLogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUserLogsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userLogs);
});
```

## GetSubscription
You can execute the `GetSubscription` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getSubscription(options?: ExecuteQueryOptions): QueryPromise<GetSubscriptionData, undefined>;

interface GetSubscriptionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetSubscriptionData, undefined>;
}
export const getSubscriptionRef: GetSubscriptionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSubscription(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetSubscriptionData, undefined>;

interface GetSubscriptionRef {
  ...
  (dc: DataConnect): QueryRef<GetSubscriptionData, undefined>;
}
export const getSubscriptionRef: GetSubscriptionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSubscriptionRef:
```typescript
const name = getSubscriptionRef.operationName;
console.log(name);
```

### Variables
The `GetSubscription` query has no variables.
### Return Type
Recall that executing the `GetSubscription` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSubscriptionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSubscriptionData {
  userSubscriptions: ({
    planType: string;
    status: string;
    expiresAt?: TimestampString | null;
  })[];
}
```
### Using `GetSubscription`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSubscription } from '@dataconnect/generated';


// Call the `getSubscription()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSubscription();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSubscription(dataConnect);

console.log(data.userSubscriptions);

// Or, you can use the `Promise` API.
getSubscription().then((response) => {
  const data = response.data;
  console.log(data.userSubscriptions);
});
```

### Using `GetSubscription`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSubscriptionRef } from '@dataconnect/generated';


// Call the `getSubscriptionRef()` function to get a reference to the query.
const ref = getSubscriptionRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSubscriptionRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userSubscriptions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userSubscriptions);
});
```

## ListSubscriptions
You can execute the `ListSubscriptions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSubscriptions(options?: ExecuteQueryOptions): QueryPromise<ListSubscriptionsData, undefined>;

interface ListSubscriptionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSubscriptionsData, undefined>;
}
export const listSubscriptionsRef: ListSubscriptionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSubscriptions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSubscriptionsData, undefined>;

interface ListSubscriptionsRef {
  ...
  (dc: DataConnect): QueryRef<ListSubscriptionsData, undefined>;
}
export const listSubscriptionsRef: ListSubscriptionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSubscriptionsRef:
```typescript
const name = listSubscriptionsRef.operationName;
console.log(name);
```

### Variables
The `ListSubscriptions` query has no variables.
### Return Type
Recall that executing the `ListSubscriptions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSubscriptionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListSubscriptionsData {
  userSubscriptions: ({
    planType: string;
    status: string;
  })[];
}
```
### Using `ListSubscriptions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSubscriptions } from '@dataconnect/generated';


// Call the `listSubscriptions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSubscriptions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSubscriptions(dataConnect);

console.log(data.userSubscriptions);

// Or, you can use the `Promise` API.
listSubscriptions().then((response) => {
  const data = response.data;
  console.log(data.userSubscriptions);
});
```

### Using `ListSubscriptions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSubscriptionsRef } from '@dataconnect/generated';


// Call the `listSubscriptionsRef()` function to get a reference to the query.
const ref = listSubscriptionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSubscriptionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userSubscriptions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userSubscriptions);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## InsertUser
You can execute the `InsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
insertUser(): MutationPromise<InsertUserData, undefined>;

interface InsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertUserData, undefined>;
}
export const insertUserRef: InsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
insertUser(dc: DataConnect): MutationPromise<InsertUserData, undefined>;

interface InsertUserRef {
  ...
  (dc: DataConnect): MutationRef<InsertUserData, undefined>;
}
export const insertUserRef: InsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the insertUserRef:
```typescript
const name = insertUserRef.operationName;
console.log(name);
```

### Variables
The `InsertUser` mutation has no variables.
### Return Type
Recall that executing the `InsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InsertUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InsertUserData {
  user_insert: User_Key;
}
```
### Using `InsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, insertUser } from '@dataconnect/generated';


// Call the `insertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await insertUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await insertUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
insertUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `InsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, insertUserRef } from '@dataconnect/generated';


// Call the `insertUserRef()` function to get a reference to the mutation.
const ref = insertUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = insertUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateUser
You can execute the `UpdateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUser(): MutationPromise<UpdateUserData, undefined>;

interface UpdateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
}
export const updateUserRef: UpdateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface UpdateUserRef {
  ...
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
}
export const updateUserRef: UpdateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRef:
```typescript
const name = updateUserRef.operationName;
console.log(name);
```

### Variables
The `UpdateUser` mutation has no variables.
### Return Type
Recall that executing the `UpdateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUser } from '@dataconnect/generated';


// Call the `updateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUser(dataConnect);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUser().then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRef } from '@dataconnect/generated';


// Call the `updateUserRef()` function to get a reference to the mutation.
const ref = updateUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## DeleteUser
You can execute the `DeleteUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUser(): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserRef:
```typescript
const name = deleteUserRef.operationName;
console.log(name);
```

### Variables
The `DeleteUser` mutation has no variables.
### Return Type
Recall that executing the `DeleteUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserData {
  user_delete?: User_Key | null;
}
```
### Using `DeleteUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUser } from '@dataconnect/generated';


// Call the `deleteUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUser(dataConnect);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
deleteUser().then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

### Using `DeleteUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserRef } from '@dataconnect/generated';


// Call the `deleteUserRef()` function to get a reference to the mutation.
const ref = deleteUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

## InsertProfile
You can execute the `InsertProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
insertProfile(): MutationPromise<InsertProfileData, undefined>;

interface InsertProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertProfileData, undefined>;
}
export const insertProfileRef: InsertProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
insertProfile(dc: DataConnect): MutationPromise<InsertProfileData, undefined>;

interface InsertProfileRef {
  ...
  (dc: DataConnect): MutationRef<InsertProfileData, undefined>;
}
export const insertProfileRef: InsertProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the insertProfileRef:
```typescript
const name = insertProfileRef.operationName;
console.log(name);
```

### Variables
The `InsertProfile` mutation has no variables.
### Return Type
Recall that executing the `InsertProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InsertProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InsertProfileData {
  profile_insert: Profile_Key;
}
```
### Using `InsertProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, insertProfile } from '@dataconnect/generated';


// Call the `insertProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await insertProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await insertProfile(dataConnect);

console.log(data.profile_insert);

// Or, you can use the `Promise` API.
insertProfile().then((response) => {
  const data = response.data;
  console.log(data.profile_insert);
});
```

### Using `InsertProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, insertProfileRef } from '@dataconnect/generated';


// Call the `insertProfileRef()` function to get a reference to the mutation.
const ref = insertProfileRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = insertProfileRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.profile_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.profile_insert);
});
```

## UpdateProfile
You can execute the `UpdateProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateProfile(): MutationPromise<UpdateProfileData, undefined>;

interface UpdateProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateProfileData, undefined>;
}
export const updateProfileRef: UpdateProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProfile(dc: DataConnect): MutationPromise<UpdateProfileData, undefined>;

interface UpdateProfileRef {
  ...
  (dc: DataConnect): MutationRef<UpdateProfileData, undefined>;
}
export const updateProfileRef: UpdateProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProfileRef:
```typescript
const name = updateProfileRef.operationName;
console.log(name);
```

### Variables
The `UpdateProfile` mutation has no variables.
### Return Type
Recall that executing the `UpdateProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProfileData {
  profile_updateMany: number;
}
```
### Using `UpdateProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProfile } from '@dataconnect/generated';


// Call the `updateProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProfile(dataConnect);

console.log(data.profile_updateMany);

// Or, you can use the `Promise` API.
updateProfile().then((response) => {
  const data = response.data;
  console.log(data.profile_updateMany);
});
```

### Using `UpdateProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProfileRef } from '@dataconnect/generated';


// Call the `updateProfileRef()` function to get a reference to the mutation.
const ref = updateProfileRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProfileRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.profile_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.profile_updateMany);
});
```

## DeleteProfile
You can execute the `DeleteProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteProfile(): MutationPromise<DeleteProfileData, undefined>;

interface DeleteProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteProfileData, undefined>;
}
export const deleteProfileRef: DeleteProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteProfile(dc: DataConnect): MutationPromise<DeleteProfileData, undefined>;

interface DeleteProfileRef {
  ...
  (dc: DataConnect): MutationRef<DeleteProfileData, undefined>;
}
export const deleteProfileRef: DeleteProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteProfileRef:
```typescript
const name = deleteProfileRef.operationName;
console.log(name);
```

### Variables
The `DeleteProfile` mutation has no variables.
### Return Type
Recall that executing the `DeleteProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteProfileData {
  profile_deleteMany: number;
}
```
### Using `DeleteProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteProfile } from '@dataconnect/generated';


// Call the `deleteProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteProfile(dataConnect);

console.log(data.profile_deleteMany);

// Or, you can use the `Promise` API.
deleteProfile().then((response) => {
  const data = response.data;
  console.log(data.profile_deleteMany);
});
```

### Using `DeleteProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteProfileRef } from '@dataconnect/generated';


// Call the `deleteProfileRef()` function to get a reference to the mutation.
const ref = deleteProfileRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteProfileRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.profile_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.profile_deleteMany);
});
```

## InsertUserRole
You can execute the `InsertUserRole` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
insertUserRole(): MutationPromise<InsertUserRoleData, undefined>;

interface InsertUserRoleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertUserRoleData, undefined>;
}
export const insertUserRoleRef: InsertUserRoleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
insertUserRole(dc: DataConnect): MutationPromise<InsertUserRoleData, undefined>;

interface InsertUserRoleRef {
  ...
  (dc: DataConnect): MutationRef<InsertUserRoleData, undefined>;
}
export const insertUserRoleRef: InsertUserRoleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the insertUserRoleRef:
```typescript
const name = insertUserRoleRef.operationName;
console.log(name);
```

### Variables
The `InsertUserRole` mutation has no variables.
### Return Type
Recall that executing the `InsertUserRole` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InsertUserRoleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InsertUserRoleData {
  userRole_insert: UserRole_Key;
}
```
### Using `InsertUserRole`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, insertUserRole } from '@dataconnect/generated';


// Call the `insertUserRole()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await insertUserRole();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await insertUserRole(dataConnect);

console.log(data.userRole_insert);

// Or, you can use the `Promise` API.
insertUserRole().then((response) => {
  const data = response.data;
  console.log(data.userRole_insert);
});
```

### Using `InsertUserRole`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, insertUserRoleRef } from '@dataconnect/generated';


// Call the `insertUserRoleRef()` function to get a reference to the mutation.
const ref = insertUserRoleRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = insertUserRoleRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userRole_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userRole_insert);
});
```

## UpdateUserRole
You can execute the `UpdateUserRole` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUserRole(): MutationPromise<UpdateUserRoleData, undefined>;

interface UpdateUserRoleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserRoleData, undefined>;
}
export const updateUserRoleRef: UpdateUserRoleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserRole(dc: DataConnect): MutationPromise<UpdateUserRoleData, undefined>;

interface UpdateUserRoleRef {
  ...
  (dc: DataConnect): MutationRef<UpdateUserRoleData, undefined>;
}
export const updateUserRoleRef: UpdateUserRoleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRoleRef:
```typescript
const name = updateUserRoleRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserRole` mutation has no variables.
### Return Type
Recall that executing the `UpdateUserRole` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserRoleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserRoleData {
  userRole_updateMany: number;
}
```
### Using `UpdateUserRole`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserRole } from '@dataconnect/generated';


// Call the `updateUserRole()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserRole();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserRole(dataConnect);

console.log(data.userRole_updateMany);

// Or, you can use the `Promise` API.
updateUserRole().then((response) => {
  const data = response.data;
  console.log(data.userRole_updateMany);
});
```

### Using `UpdateUserRole`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRoleRef } from '@dataconnect/generated';


// Call the `updateUserRoleRef()` function to get a reference to the mutation.
const ref = updateUserRoleRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRoleRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userRole_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userRole_updateMany);
});
```

## DeleteUserRole
You can execute the `DeleteUserRole` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUserRole(): MutationPromise<DeleteUserRoleData, undefined>;

interface DeleteUserRoleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserRoleData, undefined>;
}
export const deleteUserRoleRef: DeleteUserRoleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUserRole(dc: DataConnect): MutationPromise<DeleteUserRoleData, undefined>;

interface DeleteUserRoleRef {
  ...
  (dc: DataConnect): MutationRef<DeleteUserRoleData, undefined>;
}
export const deleteUserRoleRef: DeleteUserRoleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserRoleRef:
```typescript
const name = deleteUserRoleRef.operationName;
console.log(name);
```

### Variables
The `DeleteUserRole` mutation has no variables.
### Return Type
Recall that executing the `DeleteUserRole` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserRoleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserRoleData {
  userRole_deleteMany: number;
}
```
### Using `DeleteUserRole`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUserRole } from '@dataconnect/generated';


// Call the `deleteUserRole()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUserRole();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUserRole(dataConnect);

console.log(data.userRole_deleteMany);

// Or, you can use the `Promise` API.
deleteUserRole().then((response) => {
  const data = response.data;
  console.log(data.userRole_deleteMany);
});
```

### Using `DeleteUserRole`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserRoleRef } from '@dataconnect/generated';


// Call the `deleteUserRoleRef()` function to get a reference to the mutation.
const ref = deleteUserRoleRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserRoleRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userRole_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userRole_deleteMany);
});
```

## InsertUserLog
You can execute the `InsertUserLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
insertUserLog(): MutationPromise<InsertUserLogData, undefined>;

interface InsertUserLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertUserLogData, undefined>;
}
export const insertUserLogRef: InsertUserLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
insertUserLog(dc: DataConnect): MutationPromise<InsertUserLogData, undefined>;

interface InsertUserLogRef {
  ...
  (dc: DataConnect): MutationRef<InsertUserLogData, undefined>;
}
export const insertUserLogRef: InsertUserLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the insertUserLogRef:
```typescript
const name = insertUserLogRef.operationName;
console.log(name);
```

### Variables
The `InsertUserLog` mutation has no variables.
### Return Type
Recall that executing the `InsertUserLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InsertUserLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InsertUserLogData {
  userLog_insert: UserLog_Key;
}
```
### Using `InsertUserLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, insertUserLog } from '@dataconnect/generated';


// Call the `insertUserLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await insertUserLog();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await insertUserLog(dataConnect);

console.log(data.userLog_insert);

// Or, you can use the `Promise` API.
insertUserLog().then((response) => {
  const data = response.data;
  console.log(data.userLog_insert);
});
```

### Using `InsertUserLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, insertUserLogRef } from '@dataconnect/generated';


// Call the `insertUserLogRef()` function to get a reference to the mutation.
const ref = insertUserLogRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = insertUserLogRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userLog_insert);
});
```

## UpdateUserLog
You can execute the `UpdateUserLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUserLog(): MutationPromise<UpdateUserLogData, undefined>;

interface UpdateUserLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserLogData, undefined>;
}
export const updateUserLogRef: UpdateUserLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserLog(dc: DataConnect): MutationPromise<UpdateUserLogData, undefined>;

interface UpdateUserLogRef {
  ...
  (dc: DataConnect): MutationRef<UpdateUserLogData, undefined>;
}
export const updateUserLogRef: UpdateUserLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserLogRef:
```typescript
const name = updateUserLogRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserLog` mutation has no variables.
### Return Type
Recall that executing the `UpdateUserLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserLogData {
  userLog_updateMany: number;
}
```
### Using `UpdateUserLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserLog } from '@dataconnect/generated';


// Call the `updateUserLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserLog();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserLog(dataConnect);

console.log(data.userLog_updateMany);

// Or, you can use the `Promise` API.
updateUserLog().then((response) => {
  const data = response.data;
  console.log(data.userLog_updateMany);
});
```

### Using `UpdateUserLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserLogRef } from '@dataconnect/generated';


// Call the `updateUserLogRef()` function to get a reference to the mutation.
const ref = updateUserLogRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserLogRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userLog_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userLog_updateMany);
});
```

## DeleteUserLog
You can execute the `DeleteUserLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUserLog(): MutationPromise<DeleteUserLogData, undefined>;

interface DeleteUserLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserLogData, undefined>;
}
export const deleteUserLogRef: DeleteUserLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUserLog(dc: DataConnect): MutationPromise<DeleteUserLogData, undefined>;

interface DeleteUserLogRef {
  ...
  (dc: DataConnect): MutationRef<DeleteUserLogData, undefined>;
}
export const deleteUserLogRef: DeleteUserLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserLogRef:
```typescript
const name = deleteUserLogRef.operationName;
console.log(name);
```

### Variables
The `DeleteUserLog` mutation has no variables.
### Return Type
Recall that executing the `DeleteUserLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserLogData {
  userLog_deleteMany: number;
}
```
### Using `DeleteUserLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUserLog } from '@dataconnect/generated';


// Call the `deleteUserLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUserLog();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUserLog(dataConnect);

console.log(data.userLog_deleteMany);

// Or, you can use the `Promise` API.
deleteUserLog().then((response) => {
  const data = response.data;
  console.log(data.userLog_deleteMany);
});
```

### Using `DeleteUserLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserLogRef } from '@dataconnect/generated';


// Call the `deleteUserLogRef()` function to get a reference to the mutation.
const ref = deleteUserLogRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserLogRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userLog_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userLog_deleteMany);
});
```

## InsertSubscription
You can execute the `InsertSubscription` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
insertSubscription(): MutationPromise<InsertSubscriptionData, undefined>;

interface InsertSubscriptionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertSubscriptionData, undefined>;
}
export const insertSubscriptionRef: InsertSubscriptionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
insertSubscription(dc: DataConnect): MutationPromise<InsertSubscriptionData, undefined>;

interface InsertSubscriptionRef {
  ...
  (dc: DataConnect): MutationRef<InsertSubscriptionData, undefined>;
}
export const insertSubscriptionRef: InsertSubscriptionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the insertSubscriptionRef:
```typescript
const name = insertSubscriptionRef.operationName;
console.log(name);
```

### Variables
The `InsertSubscription` mutation has no variables.
### Return Type
Recall that executing the `InsertSubscription` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InsertSubscriptionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InsertSubscriptionData {
  userSubscription_insert: UserSubscription_Key;
}
```
### Using `InsertSubscription`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, insertSubscription } from '@dataconnect/generated';


// Call the `insertSubscription()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await insertSubscription();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await insertSubscription(dataConnect);

console.log(data.userSubscription_insert);

// Or, you can use the `Promise` API.
insertSubscription().then((response) => {
  const data = response.data;
  console.log(data.userSubscription_insert);
});
```

### Using `InsertSubscription`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, insertSubscriptionRef } from '@dataconnect/generated';


// Call the `insertSubscriptionRef()` function to get a reference to the mutation.
const ref = insertSubscriptionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = insertSubscriptionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userSubscription_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userSubscription_insert);
});
```

## UpdateSubscription
You can execute the `UpdateSubscription` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateSubscription(): MutationPromise<UpdateSubscriptionData, undefined>;

interface UpdateSubscriptionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateSubscriptionData, undefined>;
}
export const updateSubscriptionRef: UpdateSubscriptionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSubscription(dc: DataConnect): MutationPromise<UpdateSubscriptionData, undefined>;

interface UpdateSubscriptionRef {
  ...
  (dc: DataConnect): MutationRef<UpdateSubscriptionData, undefined>;
}
export const updateSubscriptionRef: UpdateSubscriptionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSubscriptionRef:
```typescript
const name = updateSubscriptionRef.operationName;
console.log(name);
```

### Variables
The `UpdateSubscription` mutation has no variables.
### Return Type
Recall that executing the `UpdateSubscription` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSubscriptionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSubscriptionData {
  userSubscription_updateMany: number;
}
```
### Using `UpdateSubscription`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSubscription } from '@dataconnect/generated';


// Call the `updateSubscription()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSubscription();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSubscription(dataConnect);

console.log(data.userSubscription_updateMany);

// Or, you can use the `Promise` API.
updateSubscription().then((response) => {
  const data = response.data;
  console.log(data.userSubscription_updateMany);
});
```

### Using `UpdateSubscription`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSubscriptionRef } from '@dataconnect/generated';


// Call the `updateSubscriptionRef()` function to get a reference to the mutation.
const ref = updateSubscriptionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSubscriptionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userSubscription_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userSubscription_updateMany);
});
```

## DeleteSubscription
You can execute the `DeleteSubscription` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteSubscription(): MutationPromise<DeleteSubscriptionData, undefined>;

interface DeleteSubscriptionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteSubscriptionData, undefined>;
}
export const deleteSubscriptionRef: DeleteSubscriptionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteSubscription(dc: DataConnect): MutationPromise<DeleteSubscriptionData, undefined>;

interface DeleteSubscriptionRef {
  ...
  (dc: DataConnect): MutationRef<DeleteSubscriptionData, undefined>;
}
export const deleteSubscriptionRef: DeleteSubscriptionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteSubscriptionRef:
```typescript
const name = deleteSubscriptionRef.operationName;
console.log(name);
```

### Variables
The `DeleteSubscription` mutation has no variables.
### Return Type
Recall that executing the `DeleteSubscription` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteSubscriptionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteSubscriptionData {
  userSubscription_deleteMany: number;
}
```
### Using `DeleteSubscription`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteSubscription } from '@dataconnect/generated';


// Call the `deleteSubscription()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteSubscription();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteSubscription(dataConnect);

console.log(data.userSubscription_deleteMany);

// Or, you can use the `Promise` API.
deleteSubscription().then((response) => {
  const data = response.data;
  console.log(data.userSubscription_deleteMany);
});
```

### Using `DeleteSubscription`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteSubscriptionRef } from '@dataconnect/generated';


// Call the `deleteSubscriptionRef()` function to get a reference to the mutation.
const ref = deleteSubscriptionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteSubscriptionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userSubscription_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userSubscription_deleteMany);
});
```

