import React, {useEffect} from 'react';
import axios from 'axios';
import { Form, Input, InputNumber, Button } from 'antd';
import './index.css';


const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function StudentProfile({ student, onBack, onSave}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (student) {
      form.setFieldsValue({ ...student });
    } else {
      form.resetFields();
    }
  }, [student, form]);

  const handleFinish = async (values) => {
    try {
      const response = student?.id
        ? await axios.put(`${API_URL}` + 'students' + `?id=eq.${student.id}`, values, {
            supervisor_id: values.supervisor_id
          }, { headers: API_HEADERS })
        : await axios.post(API_URL, values, { headers: API_HEADERS });

      onSave(student?.id ? { ...student, ...values } : response.data[0]); // Supabase возвращает массив
    } catch (err) {
      console.error('Error saving student', err);
    }
  };

  return (
      <div className="profileContainer">
        <Button onClick={onBack} className="backLink">
          ← Back to list
        </Button>

        <h2>{student ? 'Edit student' : 'Add new student'}</h2>

        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="profileForm"
        >
          <Form.Item
              label="Full Name"
              name="studentName"
              rules={[{message: 'Enter your user id'}]}
          >
            <Input placeholder="123"/>
          </Form.Item>

          <Select>
            {supervisors.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
          </Select>

          <Form.Item
              label="Program"
              name="program"
              rules={[{message: 'Enter a program'}]}
          >
            <Input placeholder="Enter a program"/>
          </Form.Item>

          <Form.Item
              label="Department"
              name="department"
              rules={[{message: 'Enter a department'}]}
          >
            <Input placeholder="Enter a department"/>
          </Form.Item>

          <Form.Item
              label="Year"
              name="year"
          >
            <InputNumber min={1} style={{width: '100%'}} placeholder="Enter a year" />
          </Form.Item>

          <Form.Item
              label="Thesis"
              name="thesisName"
          >
            <Input placeholder = "123"></Input>
          </Form.Item>

          <Form.Item
              label="Group"
              name="groupName"
              rules={[{message: 'Enter a group ID'}]}
          >
            <Input placeholder="123"/>
          </Form.Item>

          <Form.Item
              label="Points"
              name="points"
          >
            <InputNumber min={0} style={{width: '100%'}} placeholder="Enter a score" />
          </Form.Item>

          <Form.Item
              label="Prorgess"
              name="progress"
          >
            <InputNumber min={0} style={{width: '100%'}} placeholder="Enter a progress" />
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
