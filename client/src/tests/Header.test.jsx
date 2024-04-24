import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../components/Header';
import { BrowserRouter } from 'react-router-dom';

jest.mock("@auth0/auth0-react");
jest.mock('../useLoginRedirect', () => ({
  useLoginRedirect: () => ({
    handleLogout: jest.fn(),
  }),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Header', () => {
  // Mock the useAuth0 hook before each test
  beforeEach(() => {
    const mockUseAuth0 = {
      isAuthenticated: false,
      loginWithRedirect: jest.fn(),
    };

    // Set up the default mock implementation
    const useAuth0Mock = require("@auth0/auth0-react").useAuth0;
    useAuth0Mock.mockReturnValue(mockUseAuth0);
  });

  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    // ... rest of the test
  });

  it('shows Log Out when user is authenticated', () => {
    // Override the useAuth0 hook mock implementation for this test
    const mockUseAuth0Authenticated = {
      isAuthenticated: true,
      loginWithRedirect: jest.fn(),
    };
    const useAuth0Mock = require("@auth0/auth0-react").useAuth0;
    useAuth0Mock.mockReturnValue(mockUseAuth0Authenticated);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument();
  });
});
