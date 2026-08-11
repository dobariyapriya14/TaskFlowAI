import {
  GraphQlTask,
  TaskInput as GeneratedTaskInput,
  AiInsight,
  TaskEdge as GeneratedTaskEdge,
  PageInfo as GeneratedPageInfo,
  TaskConnection as GeneratedTaskConnection,
  Priority as GeneratedPriority,
} from './generated/types';

export type GraphQLTask = GraphQlTask;
export type TaskInput = GeneratedTaskInput;
export type AIInsight = AiInsight;
export type TaskEdge = GeneratedTaskEdge;
export type PageInfo = GeneratedPageInfo;
export type TaskConnection = GeneratedTaskConnection;
export type Priority = GeneratedPriority;

export const typeDefs = `#graphql
  enum Priority {
    Low
    Normal
    High
    Urgent
  }

  type GraphQLTask {
    id: ID!
    title: String!
    category: String
    priority: Priority!
    completed: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AIInsight {
    summary: String!
    productivityScore: Int!
    recommendations: [String!]!
  }

  type TaskEdge {
    cursor: String!
    node: GraphQLTask!
  }

  type PageInfo {
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  type TaskConnection {
    edges: [TaskEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  input TaskInput {
    title: String!
    category: String
    priority: Priority
    completed: Boolean
  }

  type Query {
    tasks(category: String, completed: Boolean): [GraphQLTask!]!
    tasksConnection(
      first: Int
      after: String
      category: String
      completed: Boolean
    ): TaskConnection!
    task(id: ID!): GraphQLTask
    aiInsights: AIInsight!
  }

  type Mutation {
    createTask(input: TaskInput!): GraphQLTask!
    updateTask(id: ID!, input: TaskInput!): GraphQLTask!
    deleteTask(id: ID!): Boolean!
    toggleTaskCompleted(id: ID!): GraphQLTask!
  }

  enum TaskEventType {
    CREATED
    UPDATED
    DELETED
  }

  type TaskSubscriptionPayload {
    event: TaskEventType!
    taskId: ID!
    task: GraphQLTask
  }

  type Subscription {
    taskUpdated: TaskSubscriptionPayload!
    taskCreated: GraphQLTask!
    taskDeleted: ID!
  }
`;
