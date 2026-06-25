import { useState, useEffect } from 'react';
import { createOrganization, getOrganizations } from './api';

function Dashboard({ token, onLogout }) {
  const [orgs, setOrgs] = useState([]);
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    const data = await getOrganizations(token);
    if (Array.isArray(data)) setOrgs(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data = await createOrganization(orgName, token);

    if (data.org) {
      setSuccess(`Organization "${data.org.name}" created successfully`);
      setOrgName('');
      fetchOrgs();
    } else {
      setError(data.error || 'Failed to create organization');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Super Admin Dashboard</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3>Create Organization</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="Organization name"
            style={{ flex: 1, padding: '8px' }}
            required
          />
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
        <h3>Organizations ({orgs.length})</h3>
        {orgs.length === 0 ? (
          <p style={{ color: '#999' }}>No organizations yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{org.id}</td>
                  <td style={{ padding: '8px' }}>{org.name}</td>
                  <td style={{ padding: '8px' }}>{new Date(org.created_at).toLocaleDateString()}</td>
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