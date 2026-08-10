import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/graphql/schema.graphql',
  documents: 'src/graphql/operations.ts',
  generates: {
    'src/graphql/generated/types.ts': {
      plugins: ['typescript'],
      config: {
        enumsAsTypes: true,
      },
    },
    'src/graphql/generated/operations.ts': {
      plugins: ['typescript-operations', 'typescript-react-apollo'],
      config: {
        enumsAsTypes: true,
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
  },
};

export default config;
