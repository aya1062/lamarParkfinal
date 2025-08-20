import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../../components/pages/Login';

// Mock zustand store
vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn().mockResolvedValue(true),
    isLoading: false,
    user: null,
    isAuthenticated: false
  })
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const LoginWrapper = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
);

describe('Login Component', () => {
  it('renders login form correctly', () => {
    render(<LoginWrapper />);
    
    expect(screen.getByText('مرحباً بعودتك')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('أدخل بريدك الإلكتروني')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('أدخل كلمة المرور')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /تسجيل الدخول/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginWrapper />);
    
    const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('البريد الإلكتروني مطلوب')).toBeInTheDocument();
      expect(screen.getByText('كلمة المرور مطلوبة')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginWrapper />);
    
    const emailInput = screen.getByPlaceholderText('أدخل بريدك الإلكتروني');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('يرجى إدخال بريد إلكتروني صحيح')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(<LoginWrapper />);
    
    const passwordInput = screen.getByPlaceholderText('أدخل كلمة المرور');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});