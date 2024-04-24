import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import HomePage from '../pages/Homepage';

// Mock the necessary hooks and dependencies
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: true,
  }),
}));

jest.mock("../UserContext", () => ({
  useUser: () => ({
    user: {
      name: "John Doe",
    },
  }),
}));

jest.mock("../AuthTokenContext", () => ({
  useAuthToken: () => ({
    accessToken: "fake-access-token",
  }),
}));

jest.mock('../components/ProductList', () => {
  return function DummyProductList(props) {
    return (
      <div data-testid="product-list">
        {props.title}
      </div>
    );
  };
});

jest.mock('../components/ReviewCard', () => {
  return function DummyReviewCard(props) {
    return (
      <div data-testid="review-card">
        {props.review.content}
      </div>
    );
  };
});

describe('HomePage', () => {
    it('renders without crashing', () => {
      render(<HomePage />);
      // Similarly, check for "All Products" in the ProductList component
      const allProductsList = screen.queryByTestId('product-list');
      expect(allProductsList).toHaveTextContent("All Products");
  
      // Check if welcome back message is displayed for authenticated user
      expect(screen.queryByText("👋 Welcome back, John Doe ! We've missed you!")).toBeInTheDocument();
    });
});

