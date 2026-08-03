import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

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

interface InsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<InsertUserData, undefined>;
  operationName: string;
}
export const insertUserRef: InsertUserRef;

export function insertUser(): MutationPromise<InsertUserData, undefined>;
export function insertUser(dc: DataConnect): MutationPromise<InsertUserData, undefined>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(): MutationPromise<UpdateUserData, undefined>;
export function updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(): MutationPromise<DeleteUserData, undefined>;
export function deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserData, undefined>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;
export function getUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface InsertProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<InsertProfileData, undefined>;
  operationName: string;
}
export const insertProfileRef: InsertProfileRef;

export function insertProfile(): MutationPromise<InsertProfileData, undefined>;
export function insertProfile(dc: DataConnect): MutationPromise<InsertProfileData, undefined>;

interface UpdateProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateProfileData, undefined>;
  operationName: string;
}
export const updateProfileRef: UpdateProfileRef;

export function updateProfile(): MutationPromise<UpdateProfileData, undefined>;
export function updateProfile(dc: DataConnect): MutationPromise<UpdateProfileData, undefined>;

interface DeleteProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteProfileData, undefined>;
  operationName: string;
}
export const deleteProfileRef: DeleteProfileRef;

export function deleteProfile(): MutationPromise<DeleteProfileData, undefined>;
export function deleteProfile(dc: DataConnect): MutationPromise<DeleteProfileData, undefined>;

interface GetProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetProfileData, undefined>;
  operationName: string;
}
export const getProfileRef: GetProfileRef;

export function getProfile(options?: ExecuteQueryOptions): QueryPromise<GetProfileData, undefined>;
export function getProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetProfileData, undefined>;

interface ListProfilesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProfilesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProfilesData, undefined>;
  operationName: string;
}
export const listProfilesRef: ListProfilesRef;

export function listProfiles(options?: ExecuteQueryOptions): QueryPromise<ListProfilesData, undefined>;
export function listProfiles(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProfilesData, undefined>;

interface InsertUserRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertUserRoleData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<InsertUserRoleData, undefined>;
  operationName: string;
}
export const insertUserRoleRef: InsertUserRoleRef;

export function insertUserRole(): MutationPromise<InsertUserRoleData, undefined>;
export function insertUserRole(dc: DataConnect): MutationPromise<InsertUserRoleData, undefined>;

interface UpdateUserRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserRoleData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateUserRoleData, undefined>;
  operationName: string;
}
export const updateUserRoleRef: UpdateUserRoleRef;

export function updateUserRole(): MutationPromise<UpdateUserRoleData, undefined>;
export function updateUserRole(dc: DataConnect): MutationPromise<UpdateUserRoleData, undefined>;

interface DeleteUserRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserRoleData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserRoleData, undefined>;
  operationName: string;
}
export const deleteUserRoleRef: DeleteUserRoleRef;

export function deleteUserRole(): MutationPromise<DeleteUserRoleData, undefined>;
export function deleteUserRole(dc: DataConnect): MutationPromise<DeleteUserRoleData, undefined>;

interface GetUserRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserRoleData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserRoleData, undefined>;
  operationName: string;
}
export const getUserRoleRef: GetUserRoleRef;

export function getUserRole(options?: ExecuteQueryOptions): QueryPromise<GetUserRoleData, undefined>;
export function getUserRole(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserRoleData, undefined>;

interface ListUserRolesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserRolesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUserRolesData, undefined>;
  operationName: string;
}
export const listUserRolesRef: ListUserRolesRef;

export function listUserRoles(options?: ExecuteQueryOptions): QueryPromise<ListUserRolesData, undefined>;
export function listUserRoles(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUserRolesData, undefined>;

interface InsertUserLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertUserLogData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<InsertUserLogData, undefined>;
  operationName: string;
}
export const insertUserLogRef: InsertUserLogRef;

export function insertUserLog(): MutationPromise<InsertUserLogData, undefined>;
export function insertUserLog(dc: DataConnect): MutationPromise<InsertUserLogData, undefined>;

interface UpdateUserLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserLogData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateUserLogData, undefined>;
  operationName: string;
}
export const updateUserLogRef: UpdateUserLogRef;

export function updateUserLog(): MutationPromise<UpdateUserLogData, undefined>;
export function updateUserLog(dc: DataConnect): MutationPromise<UpdateUserLogData, undefined>;

interface DeleteUserLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserLogData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserLogData, undefined>;
  operationName: string;
}
export const deleteUserLogRef: DeleteUserLogRef;

export function deleteUserLog(): MutationPromise<DeleteUserLogData, undefined>;
export function deleteUserLog(dc: DataConnect): MutationPromise<DeleteUserLogData, undefined>;

interface GetUserLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserLogsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserLogsData, undefined>;
  operationName: string;
}
export const getUserLogsRef: GetUserLogsRef;

export function getUserLogs(options?: ExecuteQueryOptions): QueryPromise<GetUserLogsData, undefined>;
export function getUserLogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserLogsData, undefined>;

interface ListUserLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserLogsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUserLogsData, undefined>;
  operationName: string;
}
export const listUserLogsRef: ListUserLogsRef;

export function listUserLogs(options?: ExecuteQueryOptions): QueryPromise<ListUserLogsData, undefined>;
export function listUserLogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUserLogsData, undefined>;

interface InsertSubscriptionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertSubscriptionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<InsertSubscriptionData, undefined>;
  operationName: string;
}
export const insertSubscriptionRef: InsertSubscriptionRef;

export function insertSubscription(): MutationPromise<InsertSubscriptionData, undefined>;
export function insertSubscription(dc: DataConnect): MutationPromise<InsertSubscriptionData, undefined>;

interface UpdateSubscriptionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateSubscriptionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateSubscriptionData, undefined>;
  operationName: string;
}
export const updateSubscriptionRef: UpdateSubscriptionRef;

export function updateSubscription(): MutationPromise<UpdateSubscriptionData, undefined>;
export function updateSubscription(dc: DataConnect): MutationPromise<UpdateSubscriptionData, undefined>;

interface DeleteSubscriptionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteSubscriptionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteSubscriptionData, undefined>;
  operationName: string;
}
export const deleteSubscriptionRef: DeleteSubscriptionRef;

export function deleteSubscription(): MutationPromise<DeleteSubscriptionData, undefined>;
export function deleteSubscription(dc: DataConnect): MutationPromise<DeleteSubscriptionData, undefined>;

interface GetSubscriptionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetSubscriptionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetSubscriptionData, undefined>;
  operationName: string;
}
export const getSubscriptionRef: GetSubscriptionRef;

export function getSubscription(options?: ExecuteQueryOptions): QueryPromise<GetSubscriptionData, undefined>;
export function getSubscription(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetSubscriptionData, undefined>;

interface ListSubscriptionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSubscriptionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListSubscriptionsData, undefined>;
  operationName: string;
}
export const listSubscriptionsRef: ListSubscriptionsRef;

export function listSubscriptions(options?: ExecuteQueryOptions): QueryPromise<ListSubscriptionsData, undefined>;
export function listSubscriptions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSubscriptionsData, undefined>;

