export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type AiInsight = {
  __typename?: 'AIInsight';
  productivityScore: Scalars['Int']['output'];
  recommendations: Array<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
};

export type GraphQlTask = {
  __typename?: 'GraphQLTask';
  category?: Maybe<Scalars['String']['output']>;
  completed: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  priority: Priority;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createTask: GraphQlTask;
  deleteTask: Scalars['Boolean']['output'];
  toggleTaskCompleted: GraphQlTask;
  updateTask: GraphQlTask;
};

export type MutationCreateTaskArgs = {
  input: TaskInput;
};

export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};

export type MutationToggleTaskCompletedArgs = {
  id: Scalars['ID']['input'];
};

export type MutationUpdateTaskArgs = {
  id: Scalars['ID']['input'];
  input: TaskInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Priority = 'High' | 'Low' | 'Normal' | 'Urgent';

export type Query = {
  __typename?: 'Query';
  aiInsights: AiInsight;
  task?: Maybe<GraphQlTask>;
  tasks: Array<GraphQlTask>;
  tasksConnection: TaskConnection;
};

export type QueryTaskArgs = {
  id: Scalars['ID']['input'];
};

export type QueryTasksArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryTasksConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type TaskConnection = {
  __typename?: 'TaskConnection';
  edges: Array<TaskEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TaskEdge = {
  __typename?: 'TaskEdge';
  cursor: Scalars['String']['output'];
  node: GraphQlTask;
};

export type TaskInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Priority>;
  title: Scalars['String']['input'];
};
