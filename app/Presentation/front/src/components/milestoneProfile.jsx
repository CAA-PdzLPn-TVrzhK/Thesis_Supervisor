import React, { useEffect } from 'react';
import axios from 'axios';
import { Form, Input, InputNumber, Button, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function MilestoneProfile({ milestone, theses, onBack, onSave }) {
  const [form] = Form.useForm();

  if (!theses || theses.length === 0) {
    return <div>Milestone not found or loading…</div>;
  }

  // Если milestone === null, значит add: инициализируем пустыми значениями
  const isEdit = !!(milestone && milestone.id);
  const thesisTitle = isEdit ? (theses.find(t => t.id === milestone.thesis_id)?.title || '—') : '';

  useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        ...milestone,
        deadline: milestone.deadline ? dayjs(milestone.deadline) : null,
        start: milestone.start ? dayjs(milestone.start) : null,
      });
    } else {
      form.resetFields();
    }
  }, [milestone, form, isEdit]);

  const handleFinish = async (values) => {
    try {
      const url = isEdit
        ? `${API_URL}milestones?id=eq.${milestone.id}`
        : `${API_URL}milestones`;
      const method = isEdit ? 'patch' : 'post';
      const headers = {
        ...API_HEADERS,
        Prefer: 'return=representation',
      };
      const body = {
        thesis_id: values.thesis_id,
        title: values.title,
        description: values.description,
        deadline: values.deadline ? values.deadline.toISOString() : null,
        weight: values.weight,
        status: values.status,
        notified: values.notified,
        start: values.start ? values.start.toISOString() : null,
      };
      const { data } = await axios[method](url, body, { headers });
      const saved = Array.isArray(data) ? data[0] : data;
      onSave({ ...milestone, ...saved });
    } catch (err) {
      console.error('❌ Ошибка при сохранении milestone:', err);
    }
  };

  return (
    <div className="profileContainer">
      <Button onClick={onBack} className="backLink">
        ← Back to list
      </Button>
      <h2>{isEdit ? 'Edit milestone' : 'Add new milestone'}</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="profileForm"
        initialValues={isEdit ? undefined : {
          thesis_id: null,
          title: '',
          description: '',
          deadline: null,
          weight: 0,
          status: 'not started',
          notified: 'created',
          start: null,
        }}
      >
        <Form.Item
          label="Thesis"
          name="thesis_id"
          rules={[{ required: true, message: 'Select a thesis' }]}
        >
          {isEdit ? (
            <Input value={thesisTitle} disabled />
          ) : (
            <Select placeholder="Select thesis">
              {theses.map(thesis => (
                <Select.Option key={thesis.id} value={thesis.id}>{thesis.title}</Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Enter a title' }]}
        >
          <Input placeholder="Enter title" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
        >
          <TextArea placeholder="Enter description" rows={3} />
        </Form.Item>
        <Form.Item
          label="Deadline"
          name="deadline"
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Weight"
          name="weight"
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter weight" />
        </Form.Item>
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Select status' }]}
        >
          <Select placeholder="Select status">
            <Select.Option value="not started">Not Started</Select.Option>
            <Select.Option value="in progress">In Progress</Select.Option>
            <Select.Option value="done">Done</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Notified"
          name="notified"
          rules={[{ required: true, message: 'Select notification' }]}
        >
          <Select placeholder="Select notification">
            <Select.Option value="created">Created</Select.Option>
            <Select.Option value="deadline">Deadline</Select.Option>
            <Select.Option value="all notified">All Notified</Select.Option>
            <Select.Option value="in 1 hour">In 1 Hour</Select.Option>
            <Select.Option value="in 12 hours">In 12 Hours</Select.Option>
            <Select.Option value="in 1 day">In 1 Day</Select.Option>
            <Select.Option value="in 3 days">In 3 Days</Select.Option>
            <Select.Option value="in 7 days">In 7 Days</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Start"
          name="start"
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
} 