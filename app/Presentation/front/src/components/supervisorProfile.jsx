import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Spin } from 'antd';
import './index.css';
import {
  supervisorsService,
  usersService,
  groupsService
} from '@/api/services';

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
      let saved = {};
      if (supervisor?.id) {
        saved = await supervisorsService.update(supervisor.id, {});
      } else {
        saved = await supervisorsService.create({});
      }
      
      if ((values.supervisorName || values.supervisorSurname || values.department) && supervisor?.user_id) {
        await usersService.update(supervisor.user_id, {
          first_name: values.supervisorName,
          last_name: values.supervisorSurname,
          department: values.department,
        });
      }
      
      if (supervisor?.id && values.groups) {
        const supervisorId = supervisor.id;
        const currentGroupIds = supervisor?.groups?.map(g => g.id) || [];
        const newGroupIds = values.groups || [];
        
        const groupsToRemove = currentGroupIds.filter(id => !newGroupIds.includes(id));
        const groupsToAdd = newGroupIds.filter(id => !currentGroupIds.includes(id));
        
        for (const groupId of groupsToRemove) {
          await groupsService.update(groupId, { supervisor_id: null });
        }
        
        for (const groupId of groupsToAdd) {
          await groupsService.update(groupId, { supervisor_id: supervisorId });
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
