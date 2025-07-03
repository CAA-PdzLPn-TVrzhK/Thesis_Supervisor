import React, {useState} from "react";

export default function Authorization({ onAuthSuccess }){
    const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const correctPassword = '1234'; // твой пароль
    if (password === correctPassword) {
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
