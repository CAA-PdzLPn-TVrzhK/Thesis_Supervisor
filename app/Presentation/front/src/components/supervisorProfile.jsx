import React, { useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, Spin } from 'antd';
import './index.css';

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function SupervisorProfile({ supervisor, onBack, onSave}) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      id: supervisor?.id || '',
      supervisorName: supervisor?.supervisorName || '',
      department: supervisor?.department || '',
    });
  }, [supervisor, form]);

  const handleFinish = async (values) => {
    try {
      const response = supervisor?.id
        ? await axios.put(`${API_URL}?id=eq.${supervisor.id}`, values, { headers: API_HEADERS })
        : await axios.post(API_URL, values, { headers: API_HEADERS });

      onSave(supervisor?.id ? { ...supervisor, ...values } : response.data[0]); // Supabase возвращает массив
    } catch (err) {
      console.error('Error saving supervisor', err);
    }
  };

  return (
      <div className="profileContainer">
        <Button onClick={onBack} className="backLink">
          ← Back to list
        </Button>

        <h2>{supervisor ? 'Edit supervisor' : 'Add new supervisor'}</h2>
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="profileForm"
        >
          <Form.Item
              label="ID"
              name="id"
              rules={[{required: true, message: 'Enter a user ID'}]}
          >
            <Input placeholder="string" disabled={!!supervisor?.id}/>
          </Form.Item>

          <Form.Item
              label="Full Name"
              name="supervisorName"
              rules={[{required: true, message: 'Enter a user name'}]}
          >
            <Input placeholder="Name"/>
          </Form.Item>

          <Form.Item
              label="Department"
              name="department"
              rules={[{required: true, message: 'Enter a department'}]}
          >
            <Input placeholder="string"/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {supervisor ? 'Save' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </div>
  );
}
