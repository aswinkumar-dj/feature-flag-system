import { useState, useEffect } from 'react';
import { getFlags, createFlag, toggleFlag, deleteFlag } from './api';

function Dashboard({ token, username, onLogout }) {
  const [flags, setFlags] = useState([]);
  const [featureKey, setFeatureKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    const data = await getFlags(token);
    if (Array.isArray(data)) setFlags(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data = await createFlag(featureKey, token);

    if (data.flag) {
      setSuccess(`Flag "${data.flag.feature_key}" created successfully`);
      setFeatureKey('');
      fetchFlags();
    } else {
      setError(data.error || 'Failed to create flag');
    }

    setLoading(false);
  };

  const handleToggle = async (id) => {
    const data = await toggleFlag(id, token);
    if (data.is_enabled !== undefined) fetchFlags();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flag?')) return;
    const data = await deleteFlag(id, token);
    if (data.message) fetchFlags();
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Welcome, {username}</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3>Create Feature Flag</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={featureKey}
            onChange={e => setFeatureKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            placeholder="e.g. dark_mode"
            style={{ flex: 1, padding: '8px' }}
            required
          />
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
        <h3>Feature Flags ({flags.length})</h3>
        {flags.length === 0 ? (
          <p style={{ color: '#999' }}>No feature flags yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Feature Key</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.map(flag => (
                <tr key={flag.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace' }}>{flag.feature_key}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      background: flag.is_enabled ? '#d4edda' : '#f8d7da',
                      color: flag.is_enabled ? '#155724' : '#721c24'
                    }}>
                      {flag.is_enabled ? 'ON' : 'OFF'}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button
                      onClick={() => handleToggle(flag.id)}
                      style={{ marginRight: '8px', padding: '4px 10px', cursor: 'pointer' }}
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDelete(flag.id)}
                      style={{ padding: '4px 10px', cursor: 'pointer', color: 'red' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;