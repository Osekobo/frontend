import { useState, useEffect } from 'react';  // ✅ Add useEffect
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();  // ✅ Add clearError
  const navigate = useNavigate();

  // ✅ Clear any stale errors when login page loads
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    }
  };

  // Helper function to format error messages
  const formatErrorMessage = (error) => {
    if (!error) return null;

    // If it's a string, return it directly
    if (typeof error === 'string') return error;

    // If it's an array of errors (FastAPI validation errors)
    if (Array.isArray(error)) {
      return error.map(err => err.msg || JSON.stringify(err)).join(', ');
    }

    // If it's an object with detail (FastAPI standard error)
    if (error.detail) {
      if (Array.isArray(error.detail)) {
        return error.detail.map(err => err.msg).join(', ');
      }
      return error.detail;
    }

    // If it's an object with message
    if (error.message) return error.message;

    // Default fallback
    return 'An error occurred. Please try again.';
  };

  const errorMessage = formatErrorMessage(error);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700">
          Register
        </Link>
      </p>
      <p className="text-center text-gray-600 mt-4">
        <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm">
          Forgot password?
        </Link>
      </p>
    </div>
  );
};

export default Login;