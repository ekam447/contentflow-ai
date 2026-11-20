
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage('Your password has been updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
      <main className="flex-grow container section">
        <div style={{ maxWidth: '450px', margin: '60px auto' }}>
          <div className="card">
            <h1 className="text-2xl font-bold mb-md">Reset your password</h1>
            <p className="mb-md">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="alert alert-error">{error}</p>}
              {message && <p className="alert alert-success">{message}</p>}

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>

            <p className="mt-md">
              <Link to="/login">Back to login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
