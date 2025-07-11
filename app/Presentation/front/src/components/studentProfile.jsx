import React, {useEffect} from 'react';
import axios from 'axios';
import { Form, Input, InputNumber, Button, Select } from 'antd';
import './index.css';


const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function StudentProfile({ supervisors, groups, student, onBack, onSave}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (student) {
      // Если student содержит supervisor_id и peer_group_id, просто подставляем их
      // Если только supervisorName/groupName, ищем id по name
      let initialValues = { ...student };
      if (!student.supervisor_id && student.supervisorName) {
        const foundSup = supervisors.find(s => s.name === student.supervisorName);
        if (foundSup) initialValues.supervisor_id = foundSup.id;
      }
      if (!student.peer_group_id && student.groupName) {
        const foundGroup = groups.find(g => g.name === student.groupName);
        if (foundGroup) initialValues.peer_group_id = foundGroup.peer_group_id;
      }
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [student, form, supervisors, groups]);

  const handleFinish = async (values) => {
    try {
      const url = student
        ? `${API_URL}students?id=eq.${student.id}`
        : `${API_URL}students`;
      const method = student ? 'patch' : 'post';
      const headers = {
        ...API_HEADERS,
        Prefer: 'return=representation',
      };
      const body = {
        supervisor_id: values.supervisor_id,
        peer_group_id: values.peer_group_id,
        program: values.program,
        department: values.department,
        year: values.year,
        points: values.points,
        progress: values.progress,
      };
      console.log('Отправляем:', body);
      const { data } = await axios[method](url, body, { headers });
      const saved = Array.isArray(data) ? data[0] : data;

      if (values.studentName && student?.user_id || values.studentSurname && student?.user_id) {
        await axios.patch(
          `${API_URL}users?id=eq.${student.user_id}`,
          { 
            first_name: values.studentName,
            last_name: values.studentSurname,
          },
          { headers }
        );
      }

      if (values.thesisName && student?.thesis_id) {
        await axios.patch(
          `${API_URL}theses?id=eq.${student.thesis_id}`,
          { 
            title: values.thesisName,
          },
          { headers }
        );
      }

      console.log('✅ Сохранение прошло успешно:', saved);
      onSave({ ...student, ...saved });
    } catch (err) {
      console.error('❌ Ошибка при сохранении студента:', err);
      if (err.response) {
        console.error('Ответ сервера:', err.response.data);
      }
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
              label="Name"
              name="studentName"
              rules={[{message: 'Enter your name'}]}
          >
            <Input placeholder="Pupka"/>
          </Form.Item>

          <Form.Item
              label="Surname"
              name="studentSurname"
              rules={[{message: 'Enter your surname'}]}
          >
            <Input placeholder="Zalupka"/>
          </Form.Item>

          <Form.Item
            label="Supervisor"
            name="supervisor_id"
            rules={[{ required: true, message: 'Select a supervisor' }]}
          >
          <Select placeholder="Select supervisor">  
            {supervisors.map(s => (
              <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
            ))}
          </Select>
          </Form.Item>
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
            name="peer_group_id"
            rules={[{ required: true, message: 'Select a group' }]}
          >
            <Select placeholder="Select group">
            {groups.map(g => (
                <Select.Option key={g.id} value={g.id}>
                  {g.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
              label="Points"
              name="points"
          >
            <InputNumber min={0} style={{width: '100%'}} placeholder="Enter a score" />
          </Form.Item>

          <Form.Item
              label="Progress"
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
