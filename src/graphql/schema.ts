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

  input TaskInput {
    title: String!
    category: String
    priority: Priority
    completed: Boolean
  }

  type Query {
    tasks(category: String, completed: Boolean): [GraphQLTask!]!
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
