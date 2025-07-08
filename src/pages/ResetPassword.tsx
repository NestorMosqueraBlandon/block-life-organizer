import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!password || !confirm) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setMsg('Password reset successful! You can now log in.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Link</h2>
          <p className="mb-4">The reset link is invalid or missing required information.</p>
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-2 text-center">Set New Password</h2>
        {msg && <div className="text-green-600 text-center">{msg}</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <div className="text-center">
          <button type="button" className="text-blue-600 hover:underline text-sm" onClick={() => navigate('/login')} disabled={loading}>
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword; 