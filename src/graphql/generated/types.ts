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

export type DeviceTelemetry = {
  __typename?: 'DeviceTelemetry';
  batteryLevel: Scalars['Float']['output'];
  deviceModel: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCharging: Scalars['Boolean']['output'];
  osVersion: Scalars['String']['output'];
  platform: Scalars['String']['output'];
  syncedAt: Scalars['String']['output'];
};

export type DeviceTelemetryInput = {
  batteryLevel: Scalars['Float']['input'];
  deviceModel: Scalars['String']['input'];
  isCharging: Scalars['Boolean']['input'];
  osVersion: Scalars['String']['input'];
  platform: Scalars['String']['input'];
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
  syncDeviceTelemetry: DeviceTelemetry;
  toggleTaskCompleted: GraphQlTask;
  updateTask: GraphQlTask;
};

export type MutationCreateTaskArgs = {
  input: TaskInput;
};

export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};

export type MutationSyncDeviceTelemetryArgs = {
  input: DeviceTelemetryInput;
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
  deviceTelemetry?: Maybe<DeviceTelemetry>;
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

export type Subscription = {
  __typename?: 'Subscription';
  taskCreated: GraphQlTask;
  taskDeleted: Scalars['ID']['output'];
  taskUpdated: TaskSubscriptionPayload;
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

export type TaskEventType = 'CREATED' | 'DELETED' | 'UPDATED';

export type TaskInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Priority>;
  title: Scalars['String']['input'];
};

export type TaskSubscriptionPayload = {
  __typename?: 'TaskSubscriptionPayload';
  event: TaskEventType;
  task?: Maybe<GraphQlTask>;
  taskId: Scalars['ID']['output'];
};
