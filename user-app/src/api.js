const BASE_URL = 'https://feature-flag-system-xcqm.onrender.com/api';

export const getOrganizations = async () => {
  const res = await fetch(`${BASE_URL}/organizations/public`);
  return res.json();
};

export const checkFlag = async (feature_key, org_id) => {
  const res = await fetch(`${BASE_URL}/flags/check?feature_key=${feature_key}&org_id=${org_id}`);
  return res.json();
};