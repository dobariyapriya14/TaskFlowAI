import { gql } from '@apollo/client';

export const TASK_FRAGMENT = gql`
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

export const GET_TASKS_QUERY = gql`
  ${TASK_FRAGMENT}
  query GetTasks($category: String, $completed: Boolean) {
    tasks(category: $category, completed: $completed) {
      ...TaskFields
    }
  }
`;

export const GET_TASKS_CONNECTION_QUERY = gql`
  ${TASK_FRAGMENT}
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
`;

export const GET_TASK_BY_ID_QUERY = gql`
  ${TASK_FRAGMENT}
  query GetTaskById($id: ID!) {
    task(id: $id) {
      ...TaskFields
    }
  }
`;

export const GET_AI_INSIGHTS_QUERY = gql`
  query GetAIInsights {
    aiInsights {
      summary
      productivityScore
      recommendations
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  ${TASK_FRAGMENT}
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  ${TASK_FRAGMENT}
  mutation UpdateTask($id: ID!, $input: TaskInput!) {
    updateTask(id: $id, input: $input) {
      ...TaskFields
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const TOGGLE_TASK_COMPLETED_MUTATION = gql`
  ${TASK_FRAGMENT}
  mutation ToggleTaskCompleted($id: ID!) {
    toggleTaskCompleted(id: $id) {
      ...TaskFields
    }
  }
`;

export const TASK_UPDATED_SUBSCRIPTION = gql`
  ${TASK_FRAGMENT}
  subscription OnTaskUpdated {
    taskUpdated {
      event
      taskId
      task {
        ...TaskFields
      }
    }
  }
`;

export const TASK_CREATED_SUBSCRIPTION = gql`
  ${TASK_FRAGMENT}
  subscription OnTaskCreated {
    taskCreated {
      ...TaskFields
    }
  }
`;

export const TASK_DELETED_SUBSCRIPTION = gql`
  subscription OnTaskDeleted {
    taskDeleted
  }
`;
