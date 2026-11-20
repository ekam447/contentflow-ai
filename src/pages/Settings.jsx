
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';

export function Settings() {
  const { user, resetPassword } = useAuth();

  const [tab, setTab] = useState('profile');
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ''
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function clearMessages() {
    setMessage('');
    setError('');
  }

  async function saveProfile(e) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });

      if (error) throw error;

      setMessage('Your profile has been updated.');
    } catch (err) {
      setError(err.message || 'Could not update your profile.');
    } finally {
      setLoading(false);
    }
  }

  async function sendPasswordReset() {
    clearMessages();
    setLoading(true);

    try {
      const { error } = await resetPassword({
        email: user.email,
      });

      if (error) throw error;

      setMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Could not send the reset email.');
    } finally {
      setLoading(false);
    }
  }

  function changeTab(nextTab) {
    setTab(nextTab);
    clearMessages();
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg-alt)' }}
    >
      <Navbar />

      <main className="flex-grow container section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-md">
            Account settings
          </h1>

          <div className="flex gap-sm flex-wrap mb-lg">
            <button
              type="button"
              className={tab === 'profile' ? 'btn btn-primary' : 'btn'}
              onClick={() => changeTab('profile')}
            >
              Profile
            </button>

            <button
              type="button"
              className={tab === 'security' ? 'btn btn-primary' : 'btn'}
              onClick={() => changeTab('security')}
            >
              Security
            </button>

            <button
              type="button"
              className={tab === 'subscription' ? 'btn btn-primary' : 'btn'}
              onClick={() => changeTab('subscription')}
            >
              Subscription
            </button>
          </div>

          {message && (
            <div className="alert alert-success mb-md">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-md">
              {error}
            </div>
          )}

          {tab === 'profile' && (
            <div className="card">
              <h2 className="text-xl font-bold mb-md">
                Profile information
              </h2>

              <form onSubmit={saveProfile}>
                <div className="form-group">
                  <label htmlFor="full-name">Display name</label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={80}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="account-email">Email address</label>
                  <input
                    id="account-email"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                  />
                  <p className="text-sm">
                    Your registered email address.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save profile'}
                </button>
              </form>
            </div>
          )}

          {tab === 'security' && (
            <div className="card">
              <h2 className="text-xl font-bold mb-md">
                Account security
              </h2>

              <p className="mb-md">
                We will send a secure password-reset link to:
              </p>

              <p className="font-semibold mb-md">
                {user?.email}
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={sendPasswordReset}
                disabled={loading || !user?.email}
              >
                {loading ? 'Sending...' : 'Send password reset email'}
              </button>

              <p className="mt-md text-sm">
                You can use the link in the email to choose a new password.
              </p>

              <div className="mt-lg">
                <Link to="/login">Go to login</Link>
              </div>
            </div>
          )}

          {tab === 'subscription' && (
            <div className="card">
              <h2 className="text-xl font-bold mb-md">
                Subscription
              </h2>

              <p className="mb-sm">
                Current plan: <strong>Free</strong>
              </p>

              <p className="mb-md">
                Paid subscriptions are not available yet.
                No payment will be taken from your account.
              </p>

              <p className="text-sm">
                Subscription plans and billing will be added after
                payment integration is ready.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
