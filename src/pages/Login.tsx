import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://block-life-organizer.onrender.com/api';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister && !name) throw new Error('Name is required');
      if (!email || !password) throw new Error('Email and password are required');
      const res = await fetch(`${API_URL}/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      if (!isRegister) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('name', data.name || '');
        localStorage.setItem('email', data.email || '');
        navigate('/');
      } else {
        setIsRegister(false);
        setEmail('');
        setPassword('');
        setName('');
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    setResetLoading(true);
    try {
      const res = await fetch(`${API_URL}/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      if (!res.ok) throw new Error('Failed to send reset email');
      setResetMsg('If an account exists, a reset link has been sent.');
    } catch (err) {
      setResetMsg('Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      {showReset ? (
        <form onSubmit={handleResetRequest} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
          {resetMsg && <div className="text-center text-blue-600">{resetMsg}</div>}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              disabled={resetLoading}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={resetLoading}
          >
            {resetLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div className="text-center">
            <button type="button" className="text-blue-600 hover:underline text-sm" onClick={() => setShowReset(false)} disabled={resetLoading}>
              Back to Login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold mb-2 text-center">{isRegister ? 'Register' : 'Login'}</h2>
          {error && <div className="text-red-500 text-center">{error}</div>}
          {isRegister && (
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
          </button>
          <div className="text-center flex flex-col gap-2">
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setIsRegister(r => !r)}
              disabled={loading}
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setShowReset(true)}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login; 