import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('Navbar Component Unit Tests', () => {
  const mockLogout = jest.fn();
  const mockToggleTheme = jest.fn();
  const theme = createTheme({ palette: { mode: 'light' } });

  const renderComponent = (themeMode = 'light') => {
    const customTheme = createTheme({ palette: { mode: themeMode } });
    return render(
      <ThemeProvider theme={customTheme}>
        <AuthContext.Provider value={{ logout: mockLogout }}>
          <ThemeContext.Provider value={{ toggleTheme: mockToggleTheme }}>
            <Navbar />
          </ThemeContext.Provider>
        </AuthContext.Provider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders application title correctly', () => {
    renderComponent();
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  it('triggers toggleTheme when theme toggle button is clicked', () => {
    renderComponent();
    const themeBtn = screen.getByLabelText('toggle theme');
    fireEvent.click(themeBtn);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('triggers logout when logout button is clicked', () => {
    renderComponent();
    const logoutBtn = screen.getByLabelText('logout');
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
