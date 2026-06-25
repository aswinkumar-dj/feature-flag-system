const BASE_URL = 'https://feature-flag-system-xcqm.onrender.com/api';

export const loginSuperAdmin = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/super-admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const createOrganization = async (name, token) => {
  const res = await fetch(`${BASE_URL}/organizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  return res.json();
};

export const getOrganizations = async (token) => {
  const res = await fetch(`${BASE_URL}/organizations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};