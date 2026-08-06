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
