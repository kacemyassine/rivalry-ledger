import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthService } from '@/lib/authService';

jest.mock('@/lib/authService');

describe('ProtectedRoute', () => {
  test('renders children when authenticated', () => {
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to / when not authenticated', () => {
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>Visitor Page</div>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Visitor Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});