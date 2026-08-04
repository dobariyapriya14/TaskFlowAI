# GitHub Copilot Instructions for TaskFlowAI

This repository contains a React Native mobile application powered by Firebase.

## Technology Stack

- **Framework**: React Native (TypeScript)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **CI/CD**: GitHub Actions & Fastlane

## Coding Guidelines

1. **TypeScript First**: All new files must be written in TypeScript (`.ts` or `.tsx`). Use strict typing and avoid `any` wherever possible.
2. **React Functional Components**: Always use functional components and hooks (e.g., `useState`, `useEffect`). Avoid class components.
3. **Firebase Imports**: Use the modular `@react-native-firebase` SDK for all client-side code.
4. **Error Handling**: Wrap all Firebase calls and asynchronous operations in `try/catch` blocks and gracefully display errors to the user.
5. **Component Structure**: Keep UI components modular. Place them in `src/components/`. Keep screens in `src/screens/`.
6. **Authentication**: Use the `AuthContext` to determine if a user is logged in. Protect routes accordingly.
7. **Styling**: Use standard React Native `StyleSheet`. Avoid inline styles for better performance and maintainability.

When writing or refactoring code in this project, adhere to these guidelines to ensure consistency and reliability.
