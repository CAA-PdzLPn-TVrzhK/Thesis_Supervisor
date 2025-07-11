import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Form, Input, InputNumber, Button, Select } from 'antd';
import './index.css';


const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function StudentProfile({ supervisors, groups, student, onBack, onSave}) {
  const [form] = Form.useForm();
  const [availableGroups, setAvailableGroups] = useState([]);

  // Функция для фильтрации групп по супервизору
  const filterGroupsBySupervisor = (supervisorId) => {
    if (!supervisorId) {
      setAvailableGroups([]);
      return;
    }
    
    const filteredGroups = groups.filter(group => group.supervisor_id === supervisorId);
    console.log(`Группы для супервизора ${supervisorId}:`, filteredGroups);
    setAvailableGroups(filteredGroups);
  };

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
        if (foundGroup) initialValues.peer_group_id = foundGroup.id;
      }
      form.setFieldsValue(initialValues);
      
      // Фильтруем группы по выбранному супервизору при инициализации
      if (initialValues.supervisor_id) {
        filterGroupsBySupervisor(initialValues.supervisor_id);
      }
    } else {
      form.resetFields();
      setAvailableGroups([]);
    }
  }, [student, form, supervisors, groups]);

  // Обработчик изменения супервизора
  const handleSupervisorChange = (supervisorId) => {
    console.log('Выбран супервизор:', supervisorId);
    
    // Фильтруем группы по выбранному супервизору
    filterGroupsBySupervisor(supervisorId);
    
    // Сбрасываем выбранную группу, так как она может не принадлежать новому супервизору
    form.setFieldsValue({ peer_group_id: undefined });
  };

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
        username: values.username,
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
              label="Username"
              name="studentTgUs"
          >
            <Input placeholder="tg us" disabled={!!student?.id}/>
          </Form.Item>

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
          <Select 
            placeholder="Select supervisor"
            onChange={handleSupervisorChange}
          >  
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
            <Select 
              placeholder={
                availableGroups.length > 0 
                  ? "Select group" 
                  : form.getFieldValue('supervisor_id') 
                    ? "Supervisor doesn't have groups" 
                    : "First select a supervisor"
              }
              disabled={availableGroups.length === 0}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={availableGroups.length === 0 && form.getFieldValue('supervisor_id') ? "Supervisor doesn't have groups" : "No groups found"}
            >
            {availableGroups.map(g => (
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
