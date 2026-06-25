import { useState, useEffect } from 'react';
import { getOrganizations, checkFlag } from './api';

function App() {
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState('');
  const [featureKey, setFeatureKey] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    const data = await getOrganizations();
    if (Array.isArray(data)) setOrgs(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const data = await checkFlag(featureKey, orgId);

    if (data.error) {
      setError(data.error);
    } else {
      setResult(data);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Check Feature Flag</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>Check if a feature is enabled for your organization.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Organization</label>
          <select
            value={orgId}
            onChange={e => setOrgId(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '4px' }}
            required
          >
            <option value="">Select an organization</option>
            {orgs.map(org => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Feature Key</label>
          <input
            type="text"
            value={featureKey}
            onChange={e => setFeatureKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            placeholder="e.g. dark_mode"
            style={{ display: 'block', width: '100%', padding: '8px', marginTop: '4px' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1rem', padding: '12px', background: '#f8d7da', borderRadius: '4px', color: '#721c24' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '12px',
          background: result.is_enabled ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          color: result.is_enabled ? '#155724' : '#721c24',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          <p style={{ margin: 0 }}>"{result.feature_key}" is</p>
          <p style={{ margin: '4px 0 0', fontSize: '24px' }}>{result.is_enabled ? '✅ ENABLED' : '❌ DISABLED'}</p>
        </div>
      )}
    </div>
  );
}

export default App;