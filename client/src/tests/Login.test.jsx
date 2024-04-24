import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LoginPage from '../pages/LoginPage';
import { useLoginRedirect } from '../useLoginRedirect';

// Mock the necessary hooks and dependencies
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    handleLogin: jest.fn()
  })
}));

jest.mock("../useLoginRedirect", () => ({
  useLoginRedirect: () => ({
    handleLogin: jest.fn()
  })
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

describe('LoginPage', () => {
  it('renders the login page correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText('Join Pindudu Today')).toBeInTheDocument();
    expect(screen.getByText('Explore the trendiest products that inspire you')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Be Bold, Be Techy – Gear Up in Style.')).toBeInTheDocument();
  });
});
