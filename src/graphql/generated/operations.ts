/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type Priority = 'High' | 'Low' | 'Normal' | 'Urgent';

export type TaskInput = {
  category?: string | null | undefined;
  completed?: boolean | null | undefined;
  priority?: Priority | null | undefined;
  title: string;
};

export type TaskFieldsFragment = {
  id: string;
  title: string;
  category: string | null;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetTasksQueryVariables = Exact<{
  category?: string | null | undefined;
  completed?: boolean | null | undefined;
}>;

export type GetTasksQuery = {
  tasks: Array<{
    id: string;
    title: string;
    category: string | null;
    priority: Priority;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetTasksConnectionQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
  category?: string | null | undefined;
  completed?: boolean | null | undefined;
}>;

export type GetTasksConnectionQuery = {
  tasksConnection: {
    totalCount: number;
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        title: string;
        category: string | null;
        priority: Priority;
        completed: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>;
    pageInfo: {
      startCursor: string | null;
      endCursor: string | null;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  };
};

export type GetTaskByIdQueryVariables = Exact<{
  id: string | number;
}>;

export type GetTaskByIdQuery = {
  task: {
    id: string;
    title: string;
    category: string | null;
    priority: Priority;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type GetAiInsightsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAiInsightsQuery = {
  aiInsights: {
    summary: string;
    productivityScore: number;
    recommendations: Array<string>;
  };
};

export type CreateTaskMutationVariables = Exact<{
  input: TaskInput;
}>;

export type CreateTaskMutation = {
  createTask: {
    id: string;
    title: string;
    category: string | null;
    priority: Priority;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export type UpdateTaskMutationVariables = Exact<{
  id: string | number;
  input: TaskInput;
}>;

export type UpdateTaskMutation = {
  updateTask: {
    id: string;
    title: string;
    category: string | null;
    priority: Priority;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteTaskMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteTaskMutation = { deleteTask: boolean };

export type ToggleTaskCompletedMutationVariables = Exact<{
  id: string | number;
}>;

export type ToggleTaskCompletedMutation = {
  toggleTaskCompleted: {
    id: string;
    title: string;
    category: string | null;
    priority: Priority;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export const TaskFieldsFragmentDoc = gql`
  fragment TaskFields on GraphQLTask {
    id
    title
    category
    priority
    completed
    createdAt
    updatedAt
  }
`;
export const GetTasksDocument = gql`
  query GetTasks($category: String, $completed: Boolean) {
    tasks(category: $category, completed: $completed) {
      ...TaskFields
    }
  }
  ${TaskFieldsFragmentDoc}
`;

/**
 * __useGetTasksQuery__
 *
 * To run a query within a React component, call `useGetTasksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTasksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTasksQuery({
 *   variables: {
 *      category: // value for 'category'
 *      completed: // value for 'completed'
 *   },
 * });
 */
export function useGetTasksQuery(
  baseOptions?: Apollo.QueryHookOptions<GetTasksQuery, GetTasksQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTasksQuery, GetTasksQueryVariables>(
    GetTasksDocument,
    options,
  );
}
export function useGetTasksLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTasksQuery,
    GetTasksQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTasksQuery, GetTasksQueryVariables>(
    GetTasksDocument,
    options,
  );
}
// @ts-ignore
export function useGetTasksSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTasksQuery,
    GetTasksQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetTasksQuery, GetTasksQueryVariables>;
export function useGetTasksSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetTasksQuery, GetTasksQueryVariables>,
): Apollo.UseSuspenseQueryResult<
  GetTasksQuery | undefined,
  GetTasksQueryVariables
>;
export function useGetTasksSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetTasksQuery, GetTasksQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetTasksQuery, GetTasksQueryVariables>(
    GetTasksDocument,
    options,
  );
}
export type GetTasksQueryHookResult = ReturnType<typeof useGetTasksQuery>;
export type GetTasksLazyQueryHookResult = ReturnType<
  typeof useGetTasksLazyQuery
>;
export type GetTasksSuspenseQueryHookResult = ReturnType<
  typeof useGetTasksSuspenseQuery
>;
export type GetTasksQueryResult = Apollo.QueryResult<
  GetTasksQuery,
  GetTasksQueryVariables
>;
export const GetTasksConnectionDocument = gql`
  query GetTasksConnection(
    $first: Int
    $after: String
    $category: String
    $completed: Boolean
  ) {
    tasksConnection(
      first: $first
      after: $after
      category: $category
      completed: $completed
    ) {
      edges {
        cursor
        node {
          ...TaskFields
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
      totalCount
    }
  }
  ${TaskFieldsFragmentDoc}
`;

/**
 * __useGetTasksConnectionQuery__
 *
 * To run a query within a React component, call `useGetTasksConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTasksConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTasksConnectionQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      category: // value for 'category'
 *      completed: // value for 'completed'
 *   },
 * });
 */
export function useGetTasksConnectionQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetTasksConnectionQuery,
    GetTasksConnectionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTasksConnectionQuery,
    GetTasksConnectionQueryVariables
  >(GetTasksConnectionDocument, options);
}
export function useGetTasksConnectionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTasksConnectionQuery,
    GetTasksConnectionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTasksConnectionQuery,
    GetTasksConnectionQueryVariables
  >(GetTasksConnectionDocument, options);
}
// @ts-ignore
export function useGetTasksConnectionSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTasksConnectionQuery,
    GetTasksConnectionQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetTasksConnectionQuery,
  GetTasksConnectionQueryVariables
>;
export function useGetTasksConnectionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTasksConnectionQuery,
        GetTasksConnectionQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetTasksConnectionQuery | undefined,
  GetTasksConnectionQueryVariables
>;
export function useGetTasksConnectionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTasksConnectionQuery,
        GetTasksConnectionQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTasksConnectionQuery,
    GetTasksConnectionQueryVariables
  >(GetTasksConnectionDocument, options);
}
export type GetTasksConnectionQueryHookResult = ReturnType<
  typeof useGetTasksConnectionQuery
>;
export type GetTasksConnectionLazyQueryHookResult = ReturnType<
  typeof useGetTasksConnectionLazyQuery
>;
export type GetTasksConnectionSuspenseQueryHookResult = ReturnType<
  typeof useGetTasksConnectionSuspenseQuery
>;
export type GetTasksConnectionQueryResult = Apollo.QueryResult<
  GetTasksConnectionQuery,
  GetTasksConnectionQueryVariables
>;
export const GetTaskByIdDocument = gql`
  query GetTaskById($id: ID!) {
    task(id: $id) {
      ...TaskFields
    }
  }
  ${TaskFieldsFragmentDoc}
`;

/**
 * __useGetTaskByIdQuery__
 *
 * To run a query within a React component, call `useGetTaskByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTaskByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTaskByIdQuery,
    GetTaskByIdQueryVariables
  > &
    (
      | { variables: GetTaskByIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTaskByIdQuery, GetTaskByIdQueryVariables>(
    GetTaskByIdDocument,
    options,
  );
}
export function useGetTaskByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTaskByIdQuery,
    GetTaskByIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTaskByIdQuery, GetTaskByIdQueryVariables>(
    GetTaskByIdDocument,
    options,
  );
}
// @ts-ignore
export function useGetTaskByIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTaskByIdQuery,
    GetTaskByIdQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetTaskByIdQuery, GetTaskByIdQueryVariables>;
export function useGetTaskByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskByIdQuery,
        GetTaskByIdQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetTaskByIdQuery | undefined,
  GetTaskByIdQueryVariables
>;
export function useGetTaskByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskByIdQuery,
        GetTaskByIdQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetTaskByIdQuery, GetTaskByIdQueryVariables>(
    GetTaskByIdDocument,
    options,
  );
}
export type GetTaskByIdQueryHookResult = ReturnType<typeof useGetTaskByIdQuery>;
export type GetTaskByIdLazyQueryHookResult = ReturnType<
  typeof useGetTaskByIdLazyQuery
>;
export type GetTaskByIdSuspenseQueryHookResult = ReturnType<
  typeof useGetTaskByIdSuspenseQuery
>;
export type GetTaskByIdQueryResult = Apollo.QueryResult<
  GetTaskByIdQuery,
  GetTaskByIdQueryVariables
>;
export const GetAiInsightsDocument = gql`
  query GetAIInsights {
    aiInsights {
      summary
      productivityScore
      recommendations
    }
  }
`;

/**
 * __useGetAiInsightsQuery__
 *
 * To run a query within a React component, call `useGetAiInsightsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiInsightsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiInsightsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAiInsightsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAiInsightsQuery,
    GetAiInsightsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAiInsightsQuery, GetAiInsightsQueryVariables>(
    GetAiInsightsDocument,
    options,
  );
}
export function useGetAiInsightsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAiInsightsQuery,
    GetAiInsightsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAiInsightsQuery, GetAiInsightsQueryVariables>(
    GetAiInsightsDocument,
    options,
  );
}
// @ts-ignore
export function useGetAiInsightsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAiInsightsQuery,
    GetAiInsightsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetAiInsightsQuery,
  GetAiInsightsQueryVariables
>;
export function useGetAiInsightsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAiInsightsQuery,
        GetAiInsightsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetAiInsightsQuery | undefined,
  GetAiInsightsQueryVariables
>;
export function useGetAiInsightsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAiInsightsQuery,
        GetAiInsightsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAiInsightsQuery,
    GetAiInsightsQueryVariables
  >(GetAiInsightsDocument, options);
}
export type GetAiInsightsQueryHookResult = ReturnType<
  typeof useGetAiInsightsQuery
>;
export type GetAiInsightsLazyQueryHookResult = ReturnType<
  typeof useGetAiInsightsLazyQuery
>;
export type GetAiInsightsSuspenseQueryHookResult = ReturnType<
  typeof useGetAiInsightsSuspenseQuery
>;
export type GetAiInsightsQueryResult = Apollo.QueryResult<
  GetAiInsightsQuery,
  GetAiInsightsQueryVariables
>;
export const CreateTaskDocument = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
  ${TaskFieldsFragmentDoc}
`;
export type CreateTaskMutationFn = Apollo.MutationFunction<
  CreateTaskMutation,
  CreateTaskMutationVariables
>;

/**
 * __useCreateTaskMutation__
 *
 * To run a mutation, you first call `useCreateTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTaskMutation, { data, loading, error }] = useCreateTaskMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTaskMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateTaskMutation,
    CreateTaskMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateTaskMutation, CreateTaskMutationVariables>(
    CreateTaskDocument,
    options,
  );
}
export type CreateTaskMutationHookResult = ReturnType<
  typeof useCreateTaskMutation
>;
export type CreateTaskMutationResult =
  Apollo.MutationResult<CreateTaskMutation>;
export type CreateTaskMutationOptions = Apollo.BaseMutationOptions<
  CreateTaskMutation,
  CreateTaskMutationVariables
>;
export const UpdateTaskDocument = gql`
  mutation UpdateTask($id: ID!, $input: TaskInput!) {
    updateTask(id: $id, input: $input) {
      ...TaskFields
    }
  }
  ${TaskFieldsFragmentDoc}
`;
export type UpdateTaskMutationFn = Apollo.MutationFunction<
  UpdateTaskMutation,
  UpdateTaskMutationVariables
>;

/**
 * __useUpdateTaskMutation__
 *
 * To run a mutation, you first call `useUpdateTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTaskMutation, { data, loading, error }] = useUpdateTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTaskMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateTaskMutation,
    UpdateTaskMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateTaskMutation, UpdateTaskMutationVariables>(
    UpdateTaskDocument,
    options,
  );
}
export type UpdateTaskMutationHookResult = ReturnType<
  typeof useUpdateTaskMutation
>;
export type UpdateTaskMutationResult =
  Apollo.MutationResult<UpdateTaskMutation>;
export type UpdateTaskMutationOptions = Apollo.BaseMutationOptions<
  UpdateTaskMutation,
  UpdateTaskMutationVariables
>;
export const DeleteTaskDocument = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;
export type DeleteTaskMutationFn = Apollo.MutationFunction<
  DeleteTaskMutation,
  DeleteTaskMutationVariables
>;

/**
 * __useDeleteTaskMutation__
 *
 * To run a mutation, you first call `useDeleteTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTaskMutation, { data, loading, error }] = useDeleteTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTaskMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteTaskMutation,
    DeleteTaskMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteTaskMutation, DeleteTaskMutationVariables>(
    DeleteTaskDocument,
    options,
  );
}
export type DeleteTaskMutationHookResult = ReturnType<
  typeof useDeleteTaskMutation
>;
export type DeleteTaskMutationResult =
  Apollo.MutationResult<DeleteTaskMutation>;
export type DeleteTaskMutationOptions = Apollo.BaseMutationOptions<
  DeleteTaskMutation,
  DeleteTaskMutationVariables
>;
export const ToggleTaskCompletedDocument = gql`
  mutation ToggleTaskCompleted($id: ID!) {
    toggleTaskCompleted(id: $id) {
      ...TaskFields
    }
  }
  ${TaskFieldsFragmentDoc}
`;
export type ToggleTaskCompletedMutationFn = Apollo.MutationFunction<
  ToggleTaskCompletedMutation,
  ToggleTaskCompletedMutationVariables
>;

/**
 * __useToggleTaskCompletedMutation__
 *
 * To run a mutation, you first call `useToggleTaskCompletedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleTaskCompletedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleTaskCompletedMutation, { data, loading, error }] = useToggleTaskCompletedMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useToggleTaskCompletedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ToggleTaskCompletedMutation,
    ToggleTaskCompletedMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ToggleTaskCompletedMutation,
    ToggleTaskCompletedMutationVariables
  >(ToggleTaskCompletedDocument, options);
}
export type ToggleTaskCompletedMutationHookResult = ReturnType<
  typeof useToggleTaskCompletedMutation
>;
export type ToggleTaskCompletedMutationResult =
  Apollo.MutationResult<ToggleTaskCompletedMutation>;
export type ToggleTaskCompletedMutationOptions = Apollo.BaseMutationOptions<
  ToggleTaskCompletedMutation,
  ToggleTaskCompletedMutationVariables
>;
