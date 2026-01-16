import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import FileManager from '@/components/FileManager';

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuth = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('auth_token', userToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  if (!user || !token) {
    return <AuthForm onAuth={handleAuth} />;
  }

  return <FileManager user={user} token={token} onLogout={handleLogout} />;
}
