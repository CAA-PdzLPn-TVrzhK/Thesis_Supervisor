import React, {useState} from "react";
import { AUTH_PASSWORD } from '@/config/api';

export default function Authorization({ onAuthSuccess }){
    const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === AUTH_PASSWORD) {
      onAuthSuccess();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="authPage">
      <h2>Авторизация</h2>
      <input
        type="password"
        placeholder="Enter a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>OK</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
