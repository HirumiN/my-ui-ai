import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Jadwal from '../pages/Jadwal';
import dataService from '../services/dataService';
import { UserContext } from '../contexts/UserContext';

vi.mock('../services/dataService', () => ({
    default: {
        getJadwal: vi.fn(),
        createJadwal: vi.fn(),
        deleteJadwal: vi.fn(),
        updateJadwal: vi.fn(),
        getSemesters: vi.fn(),
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

describe('Jadwal Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        dataService.getSemesters.mockResolvedValue({ data: [] });
    });

    it('renders schedule list', async () => {
        const mockJadwal = [
            { id_jadwal: 1, nama: 'Matematika Dasar', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:00', sks: 3 }
        ];
        dataService.getJadwal.mockResolvedValueOnce({ data: mockJadwal });

        renderWithAuth(<Jadwal />);

        await waitFor(() => {
            expect(screen.getByText('Matematika Dasar')).toBeInTheDocument();
            expect(screen.getByText(/3 SKS/i)).toBeInTheDocument();
        });
    });

    it('opens add modal', async () => {
        dataService.getJadwal.mockResolvedValueOnce({ data: [] });
        renderWithAuth(<Jadwal />);

        await waitFor(() => screen.queryByText(/loading/i) === null);

        const addButton = screen.getByText(/add schedule/i);
        fireEvent.click(addButton);

        expect(screen.getByText('Add New Jadwal Matkul')).toBeInTheDocument();
    });
});
