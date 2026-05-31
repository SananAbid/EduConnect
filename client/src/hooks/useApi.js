import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useApi = () => {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Request failed');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const get = useCallback((url) => request(url), [request]);
  const post = useCallback((url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }), [request]);
  const put = useCallback((url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }), [request]);
  const del = useCallback((url) => request(url, { method: 'DELETE' }), [request]);

  return { loading, error, get, post, put, del, setError };
};
