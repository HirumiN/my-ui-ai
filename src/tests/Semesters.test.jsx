import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Semesters from '../pages/Semesters';
import dataService from '../services/dataService';
import { UserContext } from '../contexts/UserContext';

// Mock dataService
vi.mock('../services/dataService', () => ({
    default: {
        getSemesters: vi.fn(),
        createSemester: vi.fn(),
        deleteSemester: vi.fn(),
        updateSemester: vi.fn(),
    },
}));

// Mock User Context
const mockUser = { id_user: 1, nama: 'Test User' };
const renderWithAuth = (component) => {
    return render(
        <UserContext.Provider value={{ impersonatedUser: mockUser, setImpersonatedUser: vi.fn() }}>
            {component}
        </UserContext.Provider>
    );
};

describe('Semesters Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        dataService.getSemesters.mockResolvedValueOnce({ data: [] });
        renderWithAuth(<Semesters />);
        expect(screen.getByText(/loading semesters/i)).toBeInTheDocument();
    });

    it('renders semesters list after fetching', async () => {
        const mockSemesters = [
            { id_semester: 1, tipe: 'Ganjil', tahun_ajaran: '2025/2026', tanggal_mulai: '2025-09-01', tanggal_selesai: '2026-01-31' }
        ];
        dataService.getSemesters.mockResolvedValueOnce({ data: mockSemesters });

        renderWithAuth(<Semesters />);

        await waitFor(() => {
            expect(screen.getByText('Ganjil 2025/2026')).toBeInTheDocument();
        });
    });

    it('opens add modal when button clicked', async () => {
        dataService.getSemesters.mockResolvedValueOnce({ data: [] });
        renderWithAuth(<Semesters />);

        await waitFor(() => screen.queryByText(/loading/i) === null);

        const addButton = screen.getByText(/add semester/i);
        fireEvent.click(addButton);

        expect(screen.getByText('Add New Semester')).toBeInTheDocument();
    });
});
