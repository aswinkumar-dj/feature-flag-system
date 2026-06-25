import { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [view, setView] = useState('login');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (token, org_id, username) => {
    setToken(token);
    setUsername(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('org_id');
    localStorage.removeItem('username');
    setToken(null);
    setUsername('');
    setView('login');
  };

  if (token) {
    return <Dashboard token={token} username={username} onLogout={handleLogout} />;
  }

  return (
    <div>
      {view === 'login' ? (
        <Login onLogin={handleLogin} onSwitch={() => setView('signup')} />
      ) : (
        <Signup onSwitch={() => setView('login')} />
      )}
    </div>
  );
}

export default App;