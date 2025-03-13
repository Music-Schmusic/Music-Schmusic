import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './MyApp';

// Mock the Spline components since they're external dependencies
vi.mock('@splinetool/react-spline', () => ({
  default: () => <div data-testid="mock-spline">Spline Mock</div>
}));

vi.mock('./SplineBackground', () => ({
  default: ({ currentScene }) => <div data-testid="mock-background">{currentScene}</div>
}));
// Mock the chart components from dashboard
vi.mock('recharts', () => ({
  BarChart: () => <div>Mock BarChart</div>,
  Bar: () => <div>Mock Bar</div>,
  XAxis: () => <div>Mock XAxis</div>,
  YAxis: () => <div>Mock YAxis</div>,
  Tooltip: () => <div>Mock Tooltip</div>,
  Legend: () => <div>Mock Legend</div>
}));

// Mock the Form component
vi.mock('./components/Form', () => ({
    default: ({ handleSubmit }) => (
      <div data-testid="mock-form">
        <button onClick={() => handleSubmit({ username: 'test', email: 'test@test.com' })}>
          Submit Form
        </button>
      </div>
    )
  }));
  
  // Mock react-router-dom hooks
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => vi.fn(),
      useLocation: () => ({ pathname: '/' })
    };
  });
  
  // Mock all pages
  vi.mock('./pages/dashboard', () => ({
    default: () => <div>Dashboard Mock</div>
  }));
  
  vi.mock('./pages/friends', () => ({
    default: () => <div>Friends Mock</div>
  }));
  
  vi.mock('./pages/settings.jsx', () => ({
    default: () => <div>Settings Mock</div>
  }));
  
  vi.mock('./pages/recs', () => ({
    default: () => <div>Recommended Mock</div>
  }));
  
  // Mock components that use hooks
  vi.mock('./components/ProtectedRoute.jsx', () => ({
    default: ({ children }) => <div>{children}</div>
  }));
  
  vi.mock('./components/PublicRoute.jsx', () => ({
    default: ({ children }) => <div>{children}</div>
  }));

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders home page by default', () => {
    render(<App />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('shows login/signup links when not logged in', () => {
    render(<App />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows navigation links when logged in', () => {
    localStorage.setItem('isLoggedIn', 'true');
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });
});

describe('Login Component', () => {
  it('renders login form', async () => {
    render(
      <BrowserRouter>
        <Login setIsLoggedIn={() => {}} setCurrentScene={() => {}} />
      </BrowserRouter>
    );

    // Wait for the login container to appear (due to the delay)
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Username or Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    const mockSetIsLoggedIn = vi.fn();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: 'testuser' }),
      })
    );

    render(
      <BrowserRouter>
        <Login setIsLoggedIn={mockSetIsLoggedIn} setCurrentScene={() => {}} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username or Email')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Username or Email'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /login/i }));
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/login', expect.any(Object));
  });
});

describe('SignUp Component', () => {
  it('renders signup form', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Create an account to get started')).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  it('navigates to login page when login button clicked', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Login'));
    // Add navigation assertions based on your routing setup
  });
});

describe('Navbar Component', () => {
  it('handles logout', () => {
    const mockSetIsLoggedIn = vi.fn();
    render(
      <BrowserRouter>
        <Navbar isLoggedIn={true} setIsLoggedIn={mockSetIsLoggedIn} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Logout'));
    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
    expect(localStorage.getItem('isLoggedIn')).toBeNull();
  });
});

describe('Footer Component', () => {
  it('renders github link', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    const githubLink = screen.getByRole('link');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Music-Schmusic/Music-Schmusic');
  });
});