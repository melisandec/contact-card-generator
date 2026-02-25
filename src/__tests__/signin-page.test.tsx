import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next-auth/react
const mockSignIn = jest.fn();
jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

// Import after mocks
import SignInPage from '@/app/auth/signin/page';

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('callbackUrl');
    mockSearchParams.delete('error');
  });

  it('renders the page heading and branding', () => {
    render(<SignInPage />);
    expect(screen.getByText('Sign in to CardCrafter')).toBeInTheDocument();
    expect(screen.getByText('CardCrafter')).toBeInTheDocument();
  });

  it('renders Google and GitHub sign-in buttons', () => {
    render(<SignInPage />);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
  });

  it('renders the email input and magic link button', () => {
    render(<SignInPage />);
    expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });

  it('renders terms, privacy, and guest links', () => {
    render(<SignInPage />);
    expect(screen.getByText(/by signing in/i)).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Continue as guest')).toBeInTheDocument();
  });

  it('guest link points to /editor', () => {
    render(<SignInPage />);
    const guestLink = screen.getByText('Continue as guest');
    expect(guestLink.closest('a')).toHaveAttribute('href', '/editor');
  });

  it('shows validation error for empty email', async () => {
    render(<SignInPage />);
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
      target: { value: 'notanemail' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));
    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signIn with email provider for valid email', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('email', {
        email: 'test@example.com',
        callbackUrl: '/my-cards',
        redirect: false,
      });
    });
  });

  it('shows confirmation after magic link is sent', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));
    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });

  it('calls signIn with google provider on Google button click', () => {
    mockSignIn.mockResolvedValue(undefined);
    render(<SignInPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/my-cards' });
  });

  it('calls signIn with github provider on GitHub button click', () => {
    mockSignIn.mockResolvedValue(undefined);
    render(<SignInPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in with github/i }));
    expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/my-cards' });
  });

  it('displays error from URL query parameter', () => {
    mockSearchParams.set('error', 'OAuthSignin');
    render(<SignInPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(/could not start the sign-in process/i);
  });

  it('renders divider text', () => {
    render(<SignInPage />);
    expect(screen.getByText('or continue with email')).toBeInTheDocument();
  });
});
