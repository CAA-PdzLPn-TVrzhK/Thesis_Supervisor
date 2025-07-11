import React, { useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, Spin } from 'antd';
import './index.css';

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function SupervisorProfile({ supervisor, onBack, onSave, groups = [] }) {
  const [form] = Form.useForm();

  useEffect(() => {
    // Получаем ID групп текущего супервизора для инициализации формы
    const currentGroupIds = supervisor?.groups?.map(g => g.id) || [];
    
    form.setFieldsValue({
      supervisorTgUs: supervisor?.supervisorTgUs || '',
      supervisorName: supervisor?.supervisorName || '',
      supervisorSurname: supervisor?.supervisorSurname || '',
      department: supervisor?.department || '',
      groups: currentGroupIds,
    });
  }, [supervisor, form]);

  const handleFinish = async (values) => {
    try {
      const headers = {
        ...API_HEADERS,
        Prefer: 'return=representation',
      };
      
      // 1. Обновляем супервизора (роль)
      let saved = {};
      if (supervisor?.id) {
        const { data } = await axios.patch(
          `${API_URL}supervisors?id=eq.${supervisor.id}`,
          {}, // если есть специфичные поля для роли, добавьте их сюда
          { headers }
        );
        saved = Array.isArray(data) ? data[0] : data;
      } else {
        const { data } = await axios.post(
          `${API_URL}supervisors`,
          {}, // если есть специфичные поля для роли, добавьте их сюда
          { headers }
        );
        saved = Array.isArray(data) ? data[0] : data;
      }
      
      // 2. Обновляем пользователя (имя, фамилия, департамент)
      if ((values.supervisorName || values.supervisorSurname || values.department) && supervisor?.user_id) {
        await axios.patch(
          `${API_URL}users?id=eq.${supervisor.user_id}`,
          {
            first_name: values.supervisorName,
            last_name: values.supervisorSurname,
            department: values.department,
          },
          { headers }
        );
      }
      
      // 3. Обновляем группы (назначаем/убираем группы у супервизора)
      if (supervisor?.id && values.groups) {
        const supervisorId = supervisor.id;
        const currentGroupIds = supervisor?.groups?.map(g => g.id) || [];
        const newGroupIds = values.groups || [];
        
        // Группы, которые нужно убрать у этого супервизора
        const groupsToRemove = currentGroupIds.filter(id => !newGroupIds.includes(id));
        
        // Группы, которые нужно добавить этому супервизору
        const groupsToAdd = newGroupIds.filter(id => !currentGroupIds.includes(id));
        
        // Убираем группы у супервизора (устанавливаем supervisor_id = null)
        for (const groupId of groupsToRemove) {
          await axios.patch(
            `${API_URL}peer_groups?id=eq.${groupId}`,
            { supervisor_id: null },
            { headers }
          );
        }
        
        // Добавляем группы супервизору
        for (const groupId of groupsToAdd) {
          await axios.patch(
            `${API_URL}peer_groups?id=eq.${groupId}`,
            { supervisor_id: supervisorId },
            { headers }
          );
        }
      }
      
      console.log('✅ Сохранение супервизора прошло успешно:', saved);
      onSave({ ...supervisor, ...saved });
    } catch (err) {
      console.error('❌ Ошибка при сохранении супервизора:', err);
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

        <h2>{supervisor ? 'Edit supervisor' : 'Add new supervisor'}</h2>
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="profileForm"
        >
          <Form.Item
              label="Username"
              name="supervisorTgUs"
              rules={[{required: true, message: 'Enter a username'}]}
          >
            <Input placeholder="username" disabled={!!supervisor?.id}/>
          </Form.Item>

          <Form.Item
              label="Name"
              name="supervisorName"
              rules={[{required: true, message: 'Enter a name'}]}
          >
            <Input placeholder="Name"/>
          </Form.Item>

          <Form.Item
              label="Surname"
              name="supervisorSurname"
              rules={[{required: true, message: 'Enter a surname'}]}
          >
            <Input placeholder="Surname"/>
          </Form.Item>

          <Form.Item
              label="Department"
              name="department"
              rules={[{required: true, message: 'Enter a department'}]}
          >
            <Input placeholder="Department"/>
          </Form.Item>

          <Form.Item
              label="Groups"
              name="groups"
          >
            <Select
              mode="multiple"
              placeholder="Select groups"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {groups.map(group => (
                <Select.Option key={group.id} value={group.id} label={group.name}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
              label="Students count"
              name="studentsCount"
          >
            <Input placeholder="0" disabled={true}/>
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
