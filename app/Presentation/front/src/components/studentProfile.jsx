import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button } from 'antd';
import './index.css';
const { Option } = Select;

export default function StudentProfile({ student, onBack, onSave, groupOptions = [], supervisorOptions = [] }) {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState(student?.avatarUrl || null);

  useEffect(() => {
    form.setFieldsValue({
      name: student?.name || '',
      email: student?.email || '',
      group: student?.group || undefined,
      supervisor: student?.supervisor || undefined,
      score: student?.score || '',
    });
    setAvatar(student?.avatarUrl || null);
  }, [student, form]);

  const handleFinish = (values) => {
    onSave({ ...values, avatar });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  return (
      <div className="profileContainer">
        <Button type="link" onClick={onBack} className="backLink">
          ← Back to list
        </Button>

        <div className="photoUpload">
          <div className="avatarPreview">
            {avatar
                ? <img src={avatar} alt="Avatar"/>
                : <span style={{color: '#aaa'}}>No Photo</span>
            }
          </div>
          <div className="uploadButton btn">
            Upload photo
            <input type="file" accept="image/*" onChange={handleFileChange}/>
          </div>
        </div>

        <h2>{student ? 'Edit student' : 'Add new student'}</h2>

        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="profileForm"
        >
          <Form.Item
              label="Имя"
              name="name"
              rules={[{required: true, message: 'Enter your name'}]}
          >
            <Input placeholder="Pupkin Zalupkin"/>
          </Form.Item>

          <Form.Item
              label="Email"
              name="email"
              rules={[{type: 'email', message: 'Wrong format'}]}
          >
            <Input placeholder="example@mail.com"/>
          </Form.Item>

          <Form.Item
              label="Group"
              name="group"
              rules={[{required: true, message: 'Choose a group'}]}
          >
            <Select placeholder="Choose a group">
              {groupOptions.map(g => (
                  <Option key={g} value={g}>{g}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
              label="Supervisor"
              name="supervisor"
              rules={[{required: true, message: 'Choose a supervisor'}]}
          >
            <Select placeholder="Choose a supervisor">
              {supervisorOptions.map(s => (
                  <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
              label="Score"
              name="score"
              rules={[{required: true, message: 'Enter your score'}]}
          >
            <Input placeholder="0–100"/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {student ? 'Save' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </div>
  );
}
