import React, { useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, Spin } from 'antd';
import './index.css';
const { Option } = Select;

export default function SupervisorProfile({ supervisor, onBack, onSave}) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      user_id: supervisor?.user_id || '',
      department: supervisor?.department || '',
    });
  }, [supervisor, form]);

  const handleFinish = async (values) => {
    try {
      let response;
      if (supervisor && supervisor._id) {
        // если редактируем существующего
        response = await axios.put(
          `http://52.87.161.100:8000/supervisors/${supervisor.id}`,
          {department: values.department}
        );

        const updated = { ...supervisor, ...response.data};
        onSave(updated);
      } else {
        // если добавляем нового
        response = await axios.post(
          `http://52.87.161.100:8000/supervisors/`,
          { ...values }
        );
        onSave(response.data);
      }
    } catch (err) {
      console.error('Error saving supervisor', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      // здесь можно показывать уведомление об ошибке
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
              label="User ID"
              name="user_id"
              rules={[{required: true, message: 'Enter a user ID'}]}
          >
            <Input placeholder="string" disabled={!!supervisor?._id}/>
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
