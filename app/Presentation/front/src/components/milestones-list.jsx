import axios from 'axios';
import { Table, Input, Select, DatePicker } from 'antd';
import './index.css';
import React, { useEffect, useState } from 'react';
import ControlPanel from './control-panel.jsx';
import MilestoneProfile from './milestoneProfile.jsx';
import dayjs from 'dayjs';

const { Column } = Table;
const { TextArea } = Input;

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function MilestonesList({ onBackToMenu }) {
  const [data, setData] = useState([]);
  const [display, setDisplay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [theses, setTheses] = useState([]);
  const [thesisIdToTitle, setThesisIdToTitle] = useState({});
  const [current, setCurrent] = useState('list');
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [originalDisplay, setOriginalDisplay] = useState([]); // для отката

  useEffect(() => {
    async function fetchAll() {
      try {
        console.log('🔍 Загружаем данные milestones...');
        const [milestonesData, thesesData] = await Promise.all([
          axios.get(API_URL + 'milestones', { headers: API_HEADERS }),
          axios.get(API_URL + 'theses', { headers: API_HEADERS })
        ]);
        
        const milestones = milestonesData.data;
        const thesesList = thesesData.data;

        console.log('📊 Полученные milestones:', milestones);
        console.log('📊 Полученные theses:', thesesList);

        // Создаем мап для быстрого поиска названия тезиса по id
        const thesisIdToTitleMap = {};
        thesesList.forEach(thesis => {
          thesisIdToTitleMap[thesis.id] = thesis.title;
        });

        setTheses(thesesList);
        setThesisIdToTitle(thesisIdToTitleMap);

        // Обогащаем данные milestones названиями тезисов
        const enriched = milestones.map(milestone => ({
          ...milestone,
          thesis_title: thesisIdToTitleMap[milestone.thesis_id] || '—'
        }));

        console.log('✨ Обогащенные данные:', enriched);

        setData(enriched);
        setDisplay(enriched);
      } catch (e) {
        console.error('❌ Ошибка при загрузке данных:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const filterOptions = [
    {
      name: 'status',
      label: 'Status',
      options: [
        { label: 'Not Started', value: 'not started' },
        { label: 'In Progress', value: 'in progress' },
        { label: 'Done', value: 'done' }
      ]
    },
    {
      name: 'notified',
      label: 'Notified',
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Deadline', value: 'deadline' },
        { label: 'All Notified', value: 'all notified' },
        { label: 'In 1 Hour', value: 'in 1 hour' },
        { label: 'In 12 Hours', value: 'in 12 hours' },
        { label: 'In 1 Day', value: 'in 1 day' },
        { label: 'In 3 Days', value: 'in 3 days' },
        { label: 'In 7 Days', value: 'in 7 days' }
      ]
    }
  ];

  const sortOptions = [
    { name: 'deadline', label: 'Deadline' },
    { name: 'start', label: 'Start' },
    { name: 'title', label: 'Title' },
    { name: 'weight', label: 'Weight' }
  ];

  const handleSearch = term => {
    const filtered = data.filter(item =>
      (item.title || '').toLowerCase().includes(term.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(term.toLowerCase()) ||
      (item.thesis_title || '').toLowerCase().includes(term.toLowerCase())
    );
    setDisplay(filtered);
  };

  const handleSort = ({ field, order }) => {
    const sorted = [...display].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      
      if (field === 'deadline' || field === 'start') {
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      return order === 'asc' ? valA - valB : valB - valA;
    });
    setDisplay(sorted);
  };

  const handleFilter = filters => {
    let result = data;
    
    if (filters.status) {
      result = result.filter(item => filters.status.includes(item.status));
    }
    
    if (filters.notified) {
      result = result.filter(item => filters.notified.includes(item.notified));
    }
    
    setDisplay(result);
  };

  const handleAddMilestone = () => {
    setCurrent('add');
    setSelectedMilestone(null);
  };

  // Вход в режим редактирования: сохраняем копию display
  const handleEdit = () => {
    setOriginalDisplay(display);
    setIsEditing(true);
    setSelectedRows([]);
  };

  // Удаление: только локально
  const handleDeleteMilestones = () => {
    if (selectedRows.length === 0) {
      alert('Select milestones to delete');
      return;
    }
    setDisplay(display.filter(item => !selectedRows.includes(item.id)));
    setSelectedRows([]);
  };

  const handleCellEdit = (recordId, field, value) => {
    const updatedData = data.map(item =>
      item.id === recordId ? { ...item, [field]: value } : item
    );
    setData(updatedData);
    setDisplay(updatedData);
  };

  // Save: удаляем из БД только те, которых нет в display
  const handleSaveSelectedMilestones = async () => {
    const deletedIds = data.map(m => m.id).filter(id => !display.some(d => d.id === id));
    if (deletedIds.length === 0) {
      setIsEditing(false);
      return;
    }
    try {
      await Promise.all(
        deletedIds.map(id =>
          axios.delete(`${API_URL}milestones?id=eq.${id}`, { headers: API_HEADERS })
        )
      );
      // Обновляем данные с сервера
      const milestonesResponse = await axios.get(API_URL + 'milestones', { headers: API_HEADERS });
      const milestones = milestonesResponse.data;
      const enriched = milestones.map(milestone => ({
        ...milestone,
        thesis_title: thesisIdToTitle[milestone.thesis_id] || '—'
      }));
      setData(enriched);
      setDisplay(enriched);
      setIsEditing(false);
      setSelectedRows([]);
    } catch (err) {
      alert('Ошибка при удалении: ' + (err.response?.data?.message || err.message));
    }
  };

  // Back: откат к оригинальному состоянию
  const handleBack = () => {
    setDisplay(originalDisplay.length ? originalDisplay : data);
    setIsEditing(false);
    setSelectedRows([]);
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error :(</div>;
  if (current === 'profile' || current === 'add') {
    return <MilestoneProfile
      milestone={current === 'profile' ? selectedMilestone : null}
      theses={theses}
      onBack={() => {
        setCurrent('list');
        setSelectedMilestone(null);
      }}
      onSave={updated => {
        setData(data.map(m => m.id === updated.id ? updated : m));
        setDisplay(display.map(m => m.id === updated.id ? updated : m));
        setCurrent('list');
        setSelectedMilestone(null);
      }}
    />
  }

  return (
    <main>
      <header className={"listHeader"}>
        <h1>List of Milestones</h1>
      </header>
      <div className="pageContainer">
        <ControlPanel
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
          onAdd={handleAddMilestone}
          onEdit={handleEdit}
          onDelete={handleDeleteMilestones}
          onSave={isEditing ? handleSaveSelectedMilestones : null}
          onBack={handleBack}
          isEditing={isEditing}
          filters={filterOptions}
          sorts={sortOptions}
          labels={{ 
            add: "Add Milestone", 
            edit: "Edit List", 
            delete: "Delete", 
            save: "Save" 
          }}
        />
        <div className={"tableWrapper"}>
          <Table
            dataSource={display}
            rowKey="id"
            rowSelection={isEditing ? {
              selectedRowKeys: selectedRows,
              onChange: keys => setSelectedRows(keys)
            } : null}
            pagination={false}
            scroll={{ x: 'max-content' }}
            style={{ width: '100%' }}
            rowClassName={record => (isEditing && selectedRows.includes(record.id) ? 'editing-row' : '')}
            onRow={record => {
              if (!isEditing) {
                return {
                  onClick: () => {
                    const fullMilestone = data.find(m => m.id === record.id) || record;
                    setCurrent('profile');
                    setSelectedMilestone(fullMilestone);
                  }
                };
              }
              return {};
            }}
          >
            <Column
              title="Thesis"
              dataIndex="thesis_title"
              key="thesis_title"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Select
                    value={record.thesis_id}
                    onChange={value => handleCellEdit(record.id, 'thesis_id', value)}
                    placeholder="Select thesis"
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {theses.map(thesis => (
                      <Select.Option key={thesis.id} value={thesis.id}>
                        {thesis.title}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  text || '—'
                )
              }
            />
            <Column
              title="Title"
              dataIndex="title"
              key="title"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Input
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'title', e.target.value)}
                    placeholder="Enter title"
                  />
                ) : (
                  text || '—'
                )
              }
            />
            <Column
              title="Description"
              dataIndex="description"
              key="description"
              width={200}
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <TextArea
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'description', e.target.value)}
                    placeholder="Enter description"
                    rows={2}
                    style={{ maxWidth: '300px' }}
                  />
                ) : (
                  <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {text || '—'}
                  </div>
                )
              }
            />
            <Column
              title="Deadline"
              dataIndex="deadline"
              key="deadline"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <DatePicker
                    showTime
                    value={text ? dayjs(text) : null}
                    onChange={(date) => handleCellEdit(record.id, 'deadline', date ? date.toISOString() : null)}
                    placeholder="Select deadline"
                    style={{ width: '100%' }}
                  />
                ) : (
                  text ? new Date(text).toLocaleString() : '—'
                )
              }
            />
            <Column
              title="Weight"
              dataIndex="weight"
              key="weight"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Input
                    type="number"
                    value={text || 0}
                    onChange={e => handleCellEdit(record.id, 'weight', parseInt(e.target.value) || 0)}
                    placeholder="Enter weight"
                  />
                ) : (
                  text || '0'
                )
              }
            />
            <Column
              title="Status"
              dataIndex="status"
              key="status"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Select
                    value={text}
                    onChange={value => handleCellEdit(record.id, 'status', value)}
                    placeholder="Select status"
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="not started">Not Started</Select.Option>
                    <Select.Option value="in progress">In Progress</Select.Option>
                    <Select.Option value="done">Done</Select.Option>
                  </Select>
                ) : (
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: text === 'done' ? '#d4edda' : 
                                   text === 'in progress' ? '#fff3cd' : '#f8d7da',
                    color: text === 'done' ? '#155724' : 
                          text === 'in progress' ? '#856404' : '#721c24',
                    border: `1px solid ${text === 'done' ? '#c3e6cb' : 
                                       text === 'in progress' ? '#ffeaa7' : '#f5c6cb'}`
                  }}>
                    {text || '—'}
                  </span>
                )
              }
            />
            <Column
              title="Notified"
              dataIndex="notified"
              key="notified"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Select
                    value={text}
                    onChange={value => handleCellEdit(record.id, 'notified', value)}
                    placeholder="Select notification"
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="created">Created</Select.Option>
                    <Select.Option value="deadline">Deadline</Select.Option>
                    <Select.Option value="all notified">All Notified</Select.Option>
                    <Select.Option value="in 1 hour">In 1 Hour</Select.Option>
                    <Select.Option value="in 12 hours">In 12 Hours</Select.Option>
                    <Select.Option value="in 1 day">In 1 Day</Select.Option>
                    <Select.Option value="in 3 days">In 3 Days</Select.Option>
                    <Select.Option value="in 7 days">In 7 Days</Select.Option>
                  </Select>
                ) : (
                  text || '—'
                )
              }
            />
            <Column
              title="Start"
              dataIndex="start"
              key="start"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <DatePicker
                    showTime
                    value={text ? dayjs(text) : null}
                    onChange={(date) => handleCellEdit(record.id, 'start', date ? date.toISOString() : null)}
                    placeholder="Select start date"
                    style={{ width: '100%' }}
                  />
                ) : (
                  text ? new Date(text).toLocaleString() : '—'
                )
              }
            />
          </Table>
        </div>
      </div>
    </main>
  );
} 