import { InsertUserData, UpdateUserData, DeleteUserData, GetUserData, ListUsersData, InsertProfileData, UpdateProfileData, DeleteProfileData, GetProfileData, ListProfilesData, InsertUserRoleData, UpdateUserRoleData, DeleteUserRoleData, GetUserRoleData, ListUserRolesData, InsertUserLogData, UpdateUserLogData, DeleteUserLogData, GetUserLogsData, ListUserLogsData, InsertSubscriptionData, UpdateSubscriptionData, DeleteSubscriptionData, GetSubscriptionData, ListSubscriptionsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useInsertUser(options?: useDataConnectMutationOptions<InsertUserData, FirebaseError, void>): UseDataConnectMutationResult<InsertUserData, undefined>;
export function useInsertUser(dc: DataConnect, options?: useDataConnectMutationOptions<InsertUserData, FirebaseError, void>): UseDataConnectMutationResult<InsertUserData, undefined>;

export function useUpdateUser(options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserData, undefined>;
export function useUpdateUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserData, undefined>;

export function useDeleteUser(options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;
export function useDeleteUser(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;

export function useGetUser(options?: useDataConnectQueryOptions<GetUserData>): UseDataConnectQueryResult<GetUserData, undefined>;
export function useGetUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserData>): UseDataConnectQueryResult<GetUserData, undefined>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useInsertProfile(options?: useDataConnectMutationOptions<InsertProfileData, FirebaseError, void>): UseDataConnectMutationResult<InsertProfileData, undefined>;
export function useInsertProfile(dc: DataConnect, options?: useDataConnectMutationOptions<InsertProfileData, FirebaseError, void>): UseDataConnectMutationResult<InsertProfileData, undefined>;

export function useUpdateProfile(options?: useDataConnectMutationOptions<UpdateProfileData, FirebaseError, void>): UseDataConnectMutationResult<UpdateProfileData, undefined>;
export function useUpdateProfile(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProfileData, FirebaseError, void>): UseDataConnectMutationResult<UpdateProfileData, undefined>;

export function useDeleteProfile(options?: useDataConnectMutationOptions<DeleteProfileData, FirebaseError, void>): UseDataConnectMutationResult<DeleteProfileData, undefined>;
export function useDeleteProfile(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteProfileData, FirebaseError, void>): UseDataConnectMutationResult<DeleteProfileData, undefined>;

export function useGetProfile(options?: useDataConnectQueryOptions<GetProfileData>): UseDataConnectQueryResult<GetProfileData, undefined>;
export function useGetProfile(dc: DataConnect, options?: useDataConnectQueryOptions<GetProfileData>): UseDataConnectQueryResult<GetProfileData, undefined>;

export function useListProfiles(options?: useDataConnectQueryOptions<ListProfilesData>): UseDataConnectQueryResult<ListProfilesData, undefined>;
export function useListProfiles(dc: DataConnect, options?: useDataConnectQueryOptions<ListProfilesData>): UseDataConnectQueryResult<ListProfilesData, undefined>;

export function useInsertUserRole(options?: useDataConnectMutationOptions<InsertUserRoleData, FirebaseError, void>): UseDataConnectMutationResult<InsertUserRoleData, undefined>;
export function useInsertUserRole(dc: DataConnect, options?: useDataConnectMutationOptions<InsertUserRoleData, FirebaseError, void>): UseDataConnectMutationResult<InsertUserRoleData, undefined>;

export function useUpdateUserRole(options?: useDataConnectMutationOptions<UpdateUserRoleData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserRoleData, undefined>;
export function useUpdateUserRole(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserRoleData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserRoleData, undefined>;

export function useDeleteUserRole(options?: useDataConnectMutationOptions<DeleteUserRoleData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserRoleData, undefined>;
export function useDeleteUserRole(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteUserRoleData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserRoleData, undefined>;

export function useGetUserRole(options?: useDataConnectQueryOptions<GetUserRoleData>): UseDataConnectQueryResult<GetUserRoleData, undefined>;
export function useGetUserRole(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserRoleData>): UseDataConnectQueryResult<GetUserRoleData, undefined>;

export function useListUserRoles(options?: useDataConnectQueryOptions<ListUserRolesData>): UseDataConnectQueryResult<ListUserRolesData, undefined>;
export function useListUserRoles(dc: DataConnect, options?: useDataConnectQueryOptions<ListUserRolesData>): UseDataConnectQueryResult<ListUserRolesData, undefined>;

export function useInsertUserLog(options?: useDataConnectMutationOptions<InsertUserLogData, FirebaseError, void>): UseDataConnectMutationResult<InsertUserLogData, undefined>;
export function useInsertUserLog(dc: DataConnect, options?: useDataConnectMutationOptions<InsertUserLogData, FirebaseError, void>): UseDataConnectMutationResult<InsertUserLogData, undefined>;

export function useUpdateUserLog(options?: useDataConnectMutationOptions<UpdateUserLogData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserLogData, undefined>;
export function useUpdateUserLog(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserLogData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserLogData, undefined>;

export function useDeleteUserLog(options?: useDataConnectMutationOptions<DeleteUserLogData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserLogData, undefined>;
export function useDeleteUserLog(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteUserLogData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserLogData, undefined>;

export function useGetUserLogs(options?: useDataConnectQueryOptions<GetUserLogsData>): UseDataConnectQueryResult<GetUserLogsData, undefined>;
export function useGetUserLogs(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserLogsData>): UseDataConnectQueryResult<GetUserLogsData, undefined>;

export function useListUserLogs(options?: useDataConnectQueryOptions<ListUserLogsData>): UseDataConnectQueryResult<ListUserLogsData, undefined>;
export function useListUserLogs(dc: DataConnect, options?: useDataConnectQueryOptions<ListUserLogsData>): UseDataConnectQueryResult<ListUserLogsData, undefined>;

export function useInsertSubscription(options?: useDataConnectMutationOptions<InsertSubscriptionData, FirebaseError, void>): UseDataConnectMutationResult<InsertSubscriptionData, undefined>;
export function useInsertSubscription(dc: DataConnect, options?: useDataConnectMutationOptions<InsertSubscriptionData, FirebaseError, void>): UseDataConnectMutationResult<InsertSubscriptionData, undefined>;

export function useUpdateSubscription(options?: useDataConnectMutationOptions<UpdateSubscriptionData, FirebaseError, void>): UseDataConnectMutationResult<UpdateSubscriptionData, undefined>;
export function useUpdateSubscription(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateSubscriptionData, FirebaseError, void>): UseDataConnectMutationResult<UpdateSubscriptionData, undefined>;

export function useDeleteSubscription(options?: useDataConnectMutationOptions<DeleteSubscriptionData, FirebaseError, void>): UseDataConnectMutationResult<DeleteSubscriptionData, undefined>;
export function useDeleteSubscription(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteSubscriptionData, FirebaseError, void>): UseDataConnectMutationResult<DeleteSubscriptionData, undefined>;

export function useGetSubscription(options?: useDataConnectQueryOptions<GetSubscriptionData>): UseDataConnectQueryResult<GetSubscriptionData, undefined>;
export function useGetSubscription(dc: DataConnect, options?: useDataConnectQueryOptions<GetSubscriptionData>): UseDataConnectQueryResult<GetSubscriptionData, undefined>;

export function useListSubscriptions(options?: useDataConnectQueryOptions<ListSubscriptionsData>): UseDataConnectQueryResult<ListSubscriptionsData, undefined>;
export function useListSubscriptions(dc: DataConnect, options?: useDataConnectQueryOptions<ListSubscriptionsData>): UseDataConnectQueryResult<ListSubscriptionsData, undefined>;
