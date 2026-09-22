import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../components/TaskCard';

// Mock react-beautiful-dnd for isolated component testing
jest.mock('react-beautiful-dnd', () => ({
  Draggable: ({ children }) =>
    children(
      {
        draggableProps: { style: {} },
        dragHandleProps: {},
        innerRef: jest.fn(),
      },
      { isDragging: false }
    ),
}));

describe('TaskCard Component Unit Tests', () => {
  const mockTask = {
    _id: 'task_abc_789',
    title: 'Pact Contract Integration',
    description: 'Establish consumer contracts with Express backend',
    priority: 'High',
    dueDate: '2026-10-15T00:00:00.000Z',
    status: 'In Progress'
  };

  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title, description, and priority correctly', () => {
    render(<TaskCard task={mockTask} index={0} onEdit={mockOnEdit} />);

    expect(screen.getByText('Pact Contract Integration')).toBeInTheDocument();
    expect(screen.getByText('Establish consumer contracts with Express backend')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('calls onEdit callback with task data when edit button is clicked', () => {
    render(<TaskCard task={mockTask} index={0} onEdit={mockOnEdit} />);

    const editBtn = screen.getByRole('button');
    fireEvent.click(editBtn);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });
});
