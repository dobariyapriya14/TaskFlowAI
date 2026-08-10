import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TaskItem } from '../src/features/tasks/components/TaskItem';

describe('TaskItem Component', () => {
  const mockTask = {
    id: 'task-101',
    title: 'Test Task Item',
    category: 'Work',
    priority: 'High',
    completed: false,
  };

  it('renders task title and details', async () => {
    await render(
      <TaskItem item={mockTask} onEdit={jest.fn()} onDelete={jest.fn()} />,
    );

    expect(screen.getByTestId('task-item-task-101')).toBeTruthy();
    expect(screen.getByText('Test Task Item')).toBeTruthy();
    expect(screen.getByText('Work - High')).toBeTruthy();
  });

  it('renders checkmark when completed is true', async () => {
    const completedTask = { ...mockTask, completed: true };
    await render(
      <TaskItem
        item={completedTask}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleCompleted={jest.fn()}
      />,
    );

    expect(screen.getByText('✓')).toBeTruthy();
  });

  it('calls onToggleCompleted when checkbox is pressed', async () => {
    const onToggleCompletedMock = jest.fn();
    await render(
      <TaskItem
        item={mockTask}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleCompleted={onToggleCompletedMock}
      />,
    );

    await fireEvent.press(screen.getByTestId('task-toggle-task-101'));
    expect(onToggleCompletedMock).toHaveBeenCalledWith(mockTask);
  });
});
