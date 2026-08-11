import http, { IncomingMessage, ServerResponse, Server } from 'http';
import { buildSchema, graphql } from 'graphql';
import { typeDefs } from '../schema';
import { mockServerStore, MockGraphQLStore } from './store';
import { createResolvers } from './resolvers';

const getGraphiQLHTML = (endpoint: string = '/graphql') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>TaskFlowAI Mock GraphQL Server Playground</title>
  <style>
    body {
      height: 100vh;
      margin: 0;
      width: 100vw;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #graphiql {
      height: 100vh;
    }
  </style>
  <link rel="stylesheet" href="https://unpkg.com/graphiql@3.0.6/graphiql.min.css" />
</head>
<body>
  <div id="graphiql">Loading TaskFlowAI GraphiQL Playground...</div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/graphiql@3.0.6/graphiql.min.js"></script>
  <script>
    const fetcher = GraphiQL.createFetcher({
      url: '${endpoint}',
    });
    const root = ReactDOM.createRoot(document.getElementById('graphiql'));
    root.render(
      React.createElement(GraphiQL, {
        fetcher,
        defaultQuery: \`query GetInitialTasks {
  tasks {
    id
    title
    category
    priority
    completed
  }
  aiInsights {
    summary
    productivityScore
    recommendations
  }
}\`,
      })
    );
  </script>
</body>
</html>
`;

export function createMockServerHandler(
  store: MockGraphQLStore = mockServerStore,
) {
  const schema = buildSchema(typeDefs);
  const resolvers = createResolvers(store);

  return async (req: IncomingMessage, res: ServerResponse) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With',
    );

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlPath = (req.url || '/').split('?')[0];

    // Health check endpoint
    if (urlPath === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'ok',
          uptime: process.uptime(),
          taskCount: store.getTasks().length,
        }),
      );
      return;
    }

    // Reset store endpoint
    if (urlPath === '/admin/reset' && req.method === 'POST') {
      store.resetStore();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          message: 'Mock store reset to initial seed tasks',
          taskCount: store.getTasks().length,
        }),
      );
      return;
    }

    // GraphiQL Playground GET
    if ((urlPath === '/' || urlPath === '/graphql') && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getGraphiQLHTML(urlPath === '/' ? '/graphql' : urlPath));
      return;
    }

    // GraphQL POST Handler
    if ((urlPath === '/' || urlPath === '/graphql') && req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => {
        bodyStr += chunk;
      });

      req.on('end', async () => {
        try {
          const payload = JSON.parse(bodyStr || '{}');
          const { query, variables, operationName } = payload;

          if (!query) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                errors: [{ message: 'Must provide query string.' }],
              }),
            );
            return;
          }

          const result = await graphql({
            schema,
            source: query,
            rootValue: resolvers,
            variableValues: variables,
            operationName,
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              errors: [
                { message: err.message || 'Internal GraphQL Server Error' },
              ],
            }),
          );
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  };
}

let activeServer: Server | null = null;

export function startMockServer(
  port: number = 4000,
  store: MockGraphQLStore = mockServerStore,
): Promise<{ server: Server; port: number }> {
  return new Promise((resolve, reject) => {
    const handler = createMockServerHandler(store);
    const server = http.createServer(handler);

    server.on('error', err => {
      reject(err);
    });

    server.listen(port, () => {
      activeServer = server;
      resolve({ server, port });
    });
  });
}

export function stopMockServer(): Promise<void> {
  return new Promise(resolve => {
    if (activeServer) {
      activeServer.close(() => {
        activeServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}
