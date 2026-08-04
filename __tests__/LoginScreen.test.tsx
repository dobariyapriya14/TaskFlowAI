import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { LoginScreen } from '../src/screens/LoginScreen';
import { authService } from '../src/services/authService';
import { Alert } from 'react-native';

// Mock the authService
jest.mock('../src/services/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    await render(<LoginScreen />);

    expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(screen.getByText('Login')).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please fill in all fields',
    );
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('calls authService.login with correct credentials', async () => {
    await render(<LoginScreen />);

    // Simulate typing
    await fireEvent.changeText(
      screen.getByPlaceholderText('Enter your email'),
      'test@example.com',
    );
    await fireEvent.changeText(
      screen.getByPlaceholderText('Enter your password'),
      'password123',
    );

    // Simulate button press
    await fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });
  });
});
