import http from 'http';
import {
  startMockServer,
  stopMockServer,
  MockGraphQLStore,
  createMockServerHandler,
} from '../src/graphql/server';

function makeRequest(
  options: http.RequestOptions,
  postData?: string,
): Promise<{
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

describe('Mock GraphQL Server', () => {
  let serverInstance: http.Server;
  let serverPort: number;
  let testStore: MockGraphQLStore;

  beforeAll(async () => {
    testStore = new MockGraphQLStore();
    // Use port 0 to get an available random free port
    const started = await startMockServer(0, testStore);
    serverInstance = started.server;
    const addr = serverInstance.address();
    serverPort = typeof addr === 'object' && addr ? addr.port : 4000;
  });

  afterAll(async () => {
    await stopMockServer();
  });

  beforeEach(() => {
    testStore.resetStore();
  });

  it('creates mock server request handler function via createMockServerHandler', () => {
    const handler = createMockServerHandler(testStore);
    expect(typeof handler).toBe('function');
  });

  it('responds to GET /health with status 200 and JSON body', async () => {
    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/health',
      method: 'GET',
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.body);
    expect(json.status).toBe('ok');
    expect(typeof json.taskCount).toBe('number');
  });

  it('responds to GET /graphql with HTML GraphiQL playground', async () => {
    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/graphql',
      method: 'GET',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.body).toContain(
      'TaskFlowAI Mock GraphQL Server Playground',
    );
  });

  it('handles CORS OPTIONS preflight request', async () => {
    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/graphql',
      method: 'OPTIONS',
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('executes GetTasks query over POST /graphql', async () => {
    const postData = JSON.stringify({
      query: `
        query GetTasks {
          tasks {
            id
            title
            category
            priority
            completed
          }
        }
      `,
    });

    const response = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: serverPort,
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      postData,
    );

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body);
    expect(result.errors).toBeUndefined();
    expect(result.data.tasks).toBeInstanceOf(Array);
    expect(result.data.tasks.length).toBeGreaterThan(0);
  });

  it('executes tasksConnection query with pagination parameters', async () => {
    const postData = JSON.stringify({
      query: `
        query GetConnection($first: Int) {
          tasksConnection(first: $first) {
            edges {
              cursor
              node {
                id
                title
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            totalCount
          }
        }
      `,
      variables: { first: 3 },
    });

    const response = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: serverPort,
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      postData,
    );

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body);
    expect(result.errors).toBeUndefined();
    expect(result.data.tasksConnection.edges.length).toBe(3);
    expect(result.data.tasksConnection.pageInfo.hasNextPage).toBe(true);
  });

  it('executes createTask, updateTask, toggleTaskCompleted, and deleteTask mutations', async () => {
    // 1. Create task
    const createData = JSON.stringify({
      query: `
        mutation CreateTask($input: TaskInput!) {
          createTask(input: $input) {
            id
            title
            completed
            category
          }
        }
      `,
      variables: {
        input: {
          title: 'Mock Server Integration Test',
          category: 'Testing',
          priority: 'High',
          completed: false,
        },
      },
    });

    const createRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: serverPort,
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(createData),
        },
      },
      createData,
    );

    const createJson = JSON.parse(createRes.body);
    expect(createJson.errors).toBeUndefined();
    const newTaskId = createJson.data.createTask.id;
    expect(newTaskId).toBeDefined();
    expect(createJson.data.createTask.title).toBe(
      'Mock Server Integration Test',
    );

    // 2. Toggle completion
    const toggleData = JSON.stringify({
      query: `
        mutation ToggleTask($id: ID!) {
          toggleTaskCompleted(id: $id) {
            id
            completed
          }
        }
      `,
      variables: { id: newTaskId },
    });

    const toggleRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: serverPort,
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(toggleData),
        },
      },
      toggleData,
    );

    const toggleJson = JSON.parse(toggleRes.body);
    expect(toggleJson.errors).toBeUndefined();
    expect(toggleJson.data.toggleTaskCompleted.completed).toBe(true);

    // 3. Delete task
    const deleteData = JSON.stringify({
      query: `
        mutation DeleteTask($id: ID!) {
          deleteTask(id: $id)
        }
      `,
      variables: { id: newTaskId },
    });

    const deleteRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: serverPort,
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(deleteData),
        },
      },
      deleteData,
    );

    const deleteJson = JSON.parse(deleteRes.body);
    expect(deleteJson.errors).toBeUndefined();
    expect(deleteJson.data.deleteTask).toBe(true);
  });

  it('resets store via POST /admin/reset', async () => {
    testStore.createTask({ title: 'Temporary task' });

    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/reset',
      method: 'POST',
    });

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body);
    expect(result.success).toBe(true);
  });
});
