/**
 * Mock API functions for authentication
 * Replace these with real HTTP calls using fetch or axios
 * 
 * Example with fetch:
 * const response = await fetch('https://your-api.com/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, password })
 * });
 * const data = await response.json();
 * if (!response.ok) throw new Error(data.message);
 * return data;
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Mock login API call
 * Simulates network delay and returns a mock token
 */
export const apiLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock validation - simulate server error for demo
  if (credentials.email === 'error@test.com') {
    throw new Error('Invalid credentials. Please try again.');
  }

  // Return mock response
  return {
    token: `mock_token_${Date.now()}`,
    user: {
      id: '123',
      email: credentials.email,
      name: 'Test User'
    }
  };

  // Real implementation example:
  // const response = await fetch('YOUR_API_URL/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials)
  // });
  // if (!response.ok) {
  //   const error = await response.json();
  //   throw new Error(error.message || 'Login failed');
  // }
  // return response.json();
};

/**
 * Mock register API call
 * Simulates network delay and returns a mock token
 */
export const apiRegister = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock validation - simulate server error for demo
  if (credentials.email === 'taken@test.com') {
    throw new Error('Email already exists. Please use a different email.');
  }

  // Return mock response
  return {
    token: `mock_token_${Date.now()}`,
    user: {
      id: '456',
      email: credentials.email,
      name: credentials.name || 'New User'
    }
  };

  // Real implementation example:
  // const response = await fetch('YOUR_API_URL/auth/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials)
  // });
  // if (!response.ok) {
  //   const error = await response.json();
  //   throw new Error(error.message || 'Registration failed');
  // }
  // return response.json();
};
