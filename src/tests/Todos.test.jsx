import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Todos from '../pages/Todos';
import dataService from '../services/dataService';
import { UserContext } from '../contexts/UserContext';

vi.mock('../services/dataService', () => ({
    default: {
        getTodos: vi.fn(),
        createTodo: vi.fn(),
        deleteTodo: vi.fn(),
        updateTodo: vi.fn(),
    },
}));

const mockUser = { id_user: 1, nama: 'Test User' };
const renderWithAuth = (component) => {
    return render(
        <UserContext.Provider value={{ impersonatedUser: mockUser }}>
            {component}
        </UserContext.Provider>
    );
};

describe('Todos Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders todos list', async () => {
        const mockTodos = [
            { id_todo: 1, nama: 'Tugas Algoritma', tipe: 'Tugas', deskripsi: 'Kerjakan Bab 1' }
        ];
        dataService.getTodos.mockResolvedValueOnce({ data: mockTodos });

        renderWithAuth(<Todos />);

        await waitFor(() => {
            expect(screen.getByText('Tugas Algoritma')).toBeInTheDocument();
            expect(screen.getByText('Kerjakan Bab 1')).toBeInTheDocument();
        });
    });

    it('renders todo with deadline correctly', async () => {
        const mockTodos = [
            { id_todo: 2, nama: 'Deadline Task', tipe: 'Quiz', tenggat: '2025-12-31T23:59:00', deskripsi: 'Testing icon' }
        ];
        dataService.getTodos.mockResolvedValueOnce({ data: mockTodos });

        renderWithAuth(<Todos />);

        await waitFor(() => {
            expect(screen.getByText('Deadline Task')).toBeInTheDocument();
            // This ensures the Calendar icon render path is triggered
            expect(screen.getByText(/Due:/)).toBeInTheDocument();
        });
    });

    it('shows empty state when no todos', async () => {
        dataService.getTodos.mockResolvedValueOnce({ data: [] });
        renderWithAuth(<Todos />);

        await waitFor(() => {
            expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
        });
    });
});
