export interface GraphQLTask {
  __typename?: 'GraphQLTask';
  id: string;
  title: string;
  category?: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  category?: string;
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  completed?: boolean;
}

export interface AIInsight {
  __typename?: 'AIInsight';
  summary: string;
  productivityScore: number;
  recommendations: string[];
}

export interface TaskEdge {
  __typename?: 'TaskEdge';
  cursor: string;
  node: GraphQLTask;
}

export interface PageInfo {
  __typename?: 'PageInfo';
  startCursor?: string | null;
  endCursor?: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TaskConnection {
  __typename?: 'TaskConnection';
  edges: TaskEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

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
`;
