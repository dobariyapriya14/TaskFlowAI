import {
  startMockServer,
  stopMockServer,
  createMockServerHandler,
} from './mockServer';
import { mockServerStore, MockGraphQLStore, INITIAL_MOCK_TASKS } from './store';

export {
  startMockServer,
  stopMockServer,
  createMockServerHandler,
  mockServerStore,
  MockGraphQLStore,
  INITIAL_MOCK_TASKS,
};

if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  startMockServer(port)
    .then(({ port: activePort }) => {
      console.log(`🚀 TaskFlowAI Mock GraphQL Server is running!`);
      console.log(
        `📡 GraphQL Endpoint: http://localhost:${activePort}/graphql`,
      );
      console.log(
        `🎮 GraphiQL Playground: http://localhost:${activePort}/graphql`,
      );
      console.log(`❤️  Health Check: http://localhost:${activePort}/health`);
      console.log(
        `🔄 Admin Reset: POST http://localhost:${activePort}/admin/reset`,
      );
    })
    .catch(err => {
      console.error('❌ Failed to start TaskFlowAI Mock GraphQL Server:', err);
      process.exit(1);
    });
}
