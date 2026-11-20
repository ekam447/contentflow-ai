import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Copy, Edit2, Download, Trash2, FileText } from 'lucide-react';
import { Navbar, Footer } from '../components';

export function Generation() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [generation, setGeneration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [outputKey, setOutputKey] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGeneration() {
      if (!user?.id) {
        setGeneration(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { data, error } = await supabase
          .from('content_generations')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setGeneration(null);
          return;
        }

        setGeneration({
          id: data.id,
          transcript: data.transcript,
          outputs: data.outputs,
          createdAt: data.created_at,
        });
      } catch (err) {
        console.error('Failed to load generation:', err);
        setError('Could not load this content. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadGeneration();
  }, [id, user?.id]);

  const outputTypes = [
    { key: 'instagram', label: 'Instagram Caption', icon: '📷' },
    { key: 'youtube', label: 'YouTube Title & Description', icon: '▶️' },
    { key: 'linkedin', label: 'LinkedIn Post', icon: '💼' },
    { key: 'x', label: 'X/Twitter Post', icon: '🐦' },
    { key: 'blog', label: 'SEO Blog Article', icon: '📝' },
    { key: 'script', label: 'Short-form Video Script', icon: '🎬' },
    { key: 'hashtags', label: 'Hashtags & Keywords', icon: '#' },
  ];

  async function saveTranscript() {
    if (!generation || !user?.id) return;

    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('content_generations')
        .update({ transcript: generation.transcript })
        .eq('id', id);

      if (error) throw error;

      setEditing(false);
    } catch (err) {
      console.error('Failed to save transcript:', err);
      setError('Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteGeneration() {
    if (!window.confirm('Delete this content?')) return;

    try {
      const { error } = await supabase
        .from('content_generations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete generation:', err);
      setError('Could not delete this content. Please try again.');
    }
  }

  function copyContent(content) {
    navigator.clipboard.writeText(content).catch((err) => {
      console.error('Copy failed:', err);
      setError('Could not copy content. Please try again.');
    });
  }

  function downloadContent(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <Navbar />
        <main className="flex-grow container">
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            Loading content...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <Navbar />
        <main className="flex-grow container">
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2>Content not found</h2>
            <p>This generation does not exist or you don't have access to it.</p>
            {error && <p role="alert">{error}</p>}
            <Link to="/dashboard" className="btn btn-primary mt-3">
              Back to dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
      <Navbar />

      <main className="flex-grow container">
        <div className="dashboard-header mb-md">
          <Link to="/dashboard" className="btn btn-ghost mb-3">
            <FileText size={18} className="mr-1" /> Back to dashboard
          </Link>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                if (outputKey && generation.outputs?.[outputKey]) {
                  copyContent(generation.outputs[outputKey]);
                }
              }}
              disabled={!outputKey}
            >
              <Copy size={16} className="mr-1" /> Copy
            </button>

            <button
              className="btn btn-outline"
              onClick={() => {
                const content = outputKey
                  ? generation.outputs?.[outputKey]
                  : generation.transcript;

                if (content) {
                  downloadContent(content, `contentflow-${outputKey || 'transcript'}.txt`);
                }
              }}
            >
              <Download size={16} className="mr-1" /> Download
            </button>

            <button className="btn btn-ghost" onClick={deleteGeneration}>
              <Trash2 size={16} className="mr-1" /> Delete
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="card mb-md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  {new Date(generation.createdAt).toLocaleDateString()}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Source transcript
                </h2>
              </div>

              {!editing && (
                <button className="btn btn-outline" onClick={() => setEditing(true)}>
                  <Edit2 size={16} className="mr-1" /> Edit transcript
                </button>
              )}
            </div>

            <textarea
              className="textarea-control"
              value={generation.transcript}
              onChange={(e) =>
                setGeneration({ ...generation, transcript: e.target.value })
              }
              readOnly={!editing}
              rows={8}
            />

            {editing && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    loadGenerationAgain();
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={saveTranscript}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}
          </div>

          <div className="mb-md">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              Generated content
            </h2>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {outputTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setOutputKey(type.key)}
                  className="btn btn-ghost px-3 py-1.5 text-sm rounded"
                  style={{
                    backgroundColor: outputKey === type.key ? 'var(--color-primary)' : 'transparent',
                    color: outputKey === type.key ? '#ffffff' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>

            {outputKey && generation.outputs?.[outputKey] ? (
              <div className="card mb-md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {outputTypes.find((t) => t.key === outputKey)?.label}
                  </h3>

                  <button
                    className="btn btn-ghost text-xs"
                    onClick={() => copyContent(generation.outputs[outputKey])}
                  >
                    <Copy size={14} className="mr-1" /> Copy
                  </button>
                </div>

                <textarea
                  className="textarea-control"
                  value={generation.outputs[outputKey]}
                  readOnly
                  rows={10}
                />
              </div>
            ) : (
              <div className="empty-state">
                <p>Select a content type above to view the generated output.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );

  async function loadGenerationAgain() {
    const { data, error } = await supabase
      .from('content_generations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      setError('Could not reload your original transcript.');
      return;
    }

    if (data) {
      setGeneration({
        id: data.id,
        transcript: data.transcript,
        outputs: data.outputs,
        createdAt: data.created_at,
      });
    }

    setEditing(false);
  }
}
