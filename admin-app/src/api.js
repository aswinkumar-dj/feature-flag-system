const BASE_URL = 'https://feature-flag-system-xcqm.onrender.com/api';

export const getOrganizations = async () => {
  const res = await fetch(`${BASE_URL}/organizations/public`);
  return res.json();
};

export const signupAdmin = async (username, email, password, org_id) => {
  const res = await fetch(`${BASE_URL}/auth/admin/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, org_id })
  });
  return res.json();
};

export const loginAdmin = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const getFlags = async (token) => {
  const res = await fetch(`${BASE_URL}/flags`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const createFlag = async (feature_key, token) => {
  const res = await fetch(`${BASE_URL}/flags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ feature_key })
  });
  return res.json();
};

export const toggleFlag = async (id, token) => {
  const res = await fetch(`${BASE_URL}/flags/${id}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const deleteFlag = async (id, token) => {
  const res = await fetch(`${BASE_URL}/flags/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};