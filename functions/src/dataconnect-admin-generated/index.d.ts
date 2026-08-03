import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface DeleteProfileData {
  profile_deleteMany: number;
}

export interface DeleteSubscriptionData {
  userSubscription_deleteMany: number;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface DeleteUserLogData {
  userLog_deleteMany: number;
}

export interface DeleteUserRoleData {
  userRole_deleteMany: number;
}

export interface GetProfileData {
  profiles: ({
    bio: string;
    timeZone: string;
    avatarUrl?: string | null;
  })[];
}

export interface GetSubscriptionData {
  userSubscriptions: ({
    planType: string;
    status: string;
    expiresAt?: TimestampString | null;
  })[];
}

export interface GetUserData {
  user?: {
    email: string;
    displayName?: string | null;
    isActive?: boolean | null;
  };
}

export interface GetUserLogsData {
  userLogs: ({
    actionType: string;
    timestamp: TimestampString;
    metadata?: string | null;
  })[];
}

export interface GetUserRoleData {
  userRoles: ({
    roleName: string;
    assignedAt?: TimestampString | null;
  })[];
}

export interface InsertProfileData {
  profile_insert: Profile_Key;
}

export interface InsertSubscriptionData {
  userSubscription_insert: UserSubscription_Key;
}

export interface InsertUserData {
  user_insert: User_Key;
}

export interface InsertUserLogData {
  userLog_insert: UserLog_Key;
}

export interface InsertUserRoleData {
  userRole_insert: UserRole_Key;
}

export interface ListProfilesData {
  profiles: ({
    bio: string;
    timeZone: string;
  })[];
}

export interface ListSubscriptionsData {
  userSubscriptions: ({
    planType: string;
    status: string;
  })[];
}

export interface ListUserLogsData {
  userLogs: ({
    actionType: string;
  })[];
}

export interface ListUserRolesData {
  userRoles: ({
    roleName: string;
  })[];
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    email: string;
    displayName?: string | null;
  } & User_Key)[];
}

export interface Profile_Key {
  id: UUIDString;
  __typename?: 'Profile_Key';
}

export interface UpdateProfileData {
  profile_updateMany: number;
}

export interface UpdateSubscriptionData {
  userSubscription_updateMany: number;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateUserLogData {
  userLog_updateMany: number;
}

export interface UpdateUserRoleData {
  userRole_updateMany: number;
}

export interface UserLog_Key {
  id: UUIDString;
  __typename?: 'UserLog_Key';
}

export interface UserRole_Key {
  id: UUIDString;
  __typename?: 'UserRole_Key';
}

export interface UserSubscription_Key {
  id: UUIDString;
  __typename?: 'UserSubscription_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'InsertUser' Mutation. Allow users to execute without passing in DataConnect. */
export function insertUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertUserData>>;
/** Generated Node Admin SDK operation action function for the 'InsertUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertUser(options?: OperationOptions): Promise<ExecuteOperationResponse<InsertUserData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function updateUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateUser(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteUser' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteUser(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserData>>;

/** Generated Node Admin SDK operation action function for the 'GetUser' Query. Allow users to execute without passing in DataConnect. */
export function getUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserData>>;
/** Generated Node Admin SDK operation action function for the 'GetUser' Query. Allow users to pass in custom DataConnect instances. */
export function getUser(options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserData>>;

/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to execute without passing in DataConnect. */
export function listUsers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;
/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to pass in custom DataConnect instances. */
export function listUsers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;

/** Generated Node Admin SDK operation action function for the 'InsertProfile' Mutation. Allow users to execute without passing in DataConnect. */
export function insertProfile(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertProfileData>>;
/** Generated Node Admin SDK operation action function for the 'InsertProfile' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertProfile(options?: OperationOptions): Promise<ExecuteOperationResponse<InsertProfileData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateProfile' Mutation. Allow users to execute without passing in DataConnect. */
export function updateProfile(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateProfileData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateProfile' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateProfile(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateProfileData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteProfile' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteProfile(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteProfileData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteProfile' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteProfile(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteProfileData>>;

/** Generated Node Admin SDK operation action function for the 'GetProfile' Query. Allow users to execute without passing in DataConnect. */
export function getProfile(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetProfileData>>;
/** Generated Node Admin SDK operation action function for the 'GetProfile' Query. Allow users to pass in custom DataConnect instances. */
export function getProfile(options?: OperationOptions): Promise<ExecuteOperationResponse<GetProfileData>>;

/** Generated Node Admin SDK operation action function for the 'ListProfiles' Query. Allow users to execute without passing in DataConnect. */
export function listProfiles(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListProfilesData>>;
/** Generated Node Admin SDK operation action function for the 'ListProfiles' Query. Allow users to pass in custom DataConnect instances. */
export function listProfiles(options?: OperationOptions): Promise<ExecuteOperationResponse<ListProfilesData>>;

/** Generated Node Admin SDK operation action function for the 'InsertUserRole' Mutation. Allow users to execute without passing in DataConnect. */
export function insertUserRole(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertUserRoleData>>;
/** Generated Node Admin SDK operation action function for the 'InsertUserRole' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertUserRole(options?: OperationOptions): Promise<ExecuteOperationResponse<InsertUserRoleData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateUserRole' Mutation. Allow users to execute without passing in DataConnect. */
export function updateUserRole(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserRoleData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateUserRole' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateUserRole(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserRoleData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteUserRole' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteUserRole(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserRoleData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteUserRole' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteUserRole(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserRoleData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserRole' Query. Allow users to execute without passing in DataConnect. */
export function getUserRole(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserRoleData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserRole' Query. Allow users to pass in custom DataConnect instances. */
export function getUserRole(options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserRoleData>>;

/** Generated Node Admin SDK operation action function for the 'ListUserRoles' Query. Allow users to execute without passing in DataConnect. */
export function listUserRoles(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUserRolesData>>;
/** Generated Node Admin SDK operation action function for the 'ListUserRoles' Query. Allow users to pass in custom DataConnect instances. */
export function listUserRoles(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUserRolesData>>;

/** Generated Node Admin SDK operation action function for the 'InsertUserLog' Mutation. Allow users to execute without passing in DataConnect. */
export function insertUserLog(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertUserLogData>>;
/** Generated Node Admin SDK operation action function for the 'InsertUserLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertUserLog(options?: OperationOptions): Promise<ExecuteOperationResponse<InsertUserLogData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateUserLog' Mutation. Allow users to execute without passing in DataConnect. */
export function updateUserLog(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserLogData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateUserLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateUserLog(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserLogData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteUserLog' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteUserLog(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserLogData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteUserLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteUserLog(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserLogData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserLogs' Query. Allow users to execute without passing in DataConnect. */
export function getUserLogs(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserLogsData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserLogs' Query. Allow users to pass in custom DataConnect instances. */
export function getUserLogs(options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserLogsData>>;

/** Generated Node Admin SDK operation action function for the 'ListUserLogs' Query. Allow users to execute without passing in DataConnect. */
export function listUserLogs(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUserLogsData>>;
/** Generated Node Admin SDK operation action function for the 'ListUserLogs' Query. Allow users to pass in custom DataConnect instances. */
export function listUserLogs(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUserLogsData>>;

/** Generated Node Admin SDK operation action function for the 'InsertSubscription' Mutation. Allow users to execute without passing in DataConnect. */
export function insertSubscription(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertSubscriptionData>>;
/** Generated Node Admin SDK operation action function for the 'InsertSubscription' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertSubscription(options?: OperationOptions): Promise<ExecuteOperationResponse<InsertSubscriptionData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateSubscription' Mutation. Allow users to execute without passing in DataConnect. */
export function updateSubscription(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSubscriptionData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateSubscription' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateSubscription(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSubscriptionData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteSubscription' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteSubscription(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteSubscriptionData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteSubscription' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteSubscription(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteSubscriptionData>>;

/** Generated Node Admin SDK operation action function for the 'GetSubscription' Query. Allow users to execute without passing in DataConnect. */
export function getSubscription(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetSubscriptionData>>;
/** Generated Node Admin SDK operation action function for the 'GetSubscription' Query. Allow users to pass in custom DataConnect instances. */
export function getSubscription(options?: OperationOptions): Promise<ExecuteOperationResponse<GetSubscriptionData>>;

/** Generated Node Admin SDK operation action function for the 'ListSubscriptions' Query. Allow users to execute without passing in DataConnect. */
export function listSubscriptions(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSubscriptionsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSubscriptions' Query. Allow users to pass in custom DataConnect instances. */
export function listSubscriptions(options?: OperationOptions): Promise<ExecuteOperationResponse<ListSubscriptionsData>>;

