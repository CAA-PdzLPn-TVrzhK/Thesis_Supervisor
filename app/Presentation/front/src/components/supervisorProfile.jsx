import React, { useState } from 'react';

export default function SupervisorProfile({ supervisor, onBack, onSave }) {
  // Инициализируем форму полями из student или пустыми строками
  const [formData, setFormData] = useState({
    name:       supervisor?.name       || '',
    email:      supervisor?.email      || '',
    group:      supervisor?.group      || '',
    supervisor: supervisor?.supervisor || '',
    score:      supervisor?.score      || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Передаём наружу заполненные данные
    onSave(formData);
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px' }}>← Назад</button>
      <h2>{ supervisor ? 'Edit supervisor' : 'Add new supervisor' }</h2>
      <form onSubmit={handleSubmit} className="profileForm">
        <label>
          Full name:<br/>
          <input name="name"       value={formData.name}       onChange={handleChange} />
        </label><br/><br/>
        <label>
          Email:<br/>
          <input name="email"      value={formData.email}      onChange={handleChange} />
        </label><br/><br/>
        <label>
          Group:<br/>
          <input name="group"      value={formData.group}      onChange={handleChange} />
        </label><br/><br/>
        <label>
          Supervisor:<br/>
          <input name="supervisor" value={formData.supervisor} onChange={handleChange} />
        </label><br/><br/>
        <label>
          Score:<br/>
          <input name="score"      value={formData.score}      onChange={handleChange} />
        </label><br/><br/>
        <button type="submit">
          { supervisor ? 'Сохранить' : 'Добавить' }
        </button>
      </form>
    </div>
  );
}
