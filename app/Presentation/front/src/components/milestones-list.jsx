import axios from 'axios';
import { Table, Input, Select, DatePicker } from 'antd';
import './index.css';
import React, { useEffect, useState } from 'react';
import ControlPanel from './control-panel.jsx';

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

  const handleAddMilestone = async () => {
    try {
      // Создаем пустую запись на сервере
      const emptyMilestone = {
        thesis_id: null,
        title: '',
        description: '',
        deadline: null,
        weight: 0,
        status: 'not started',
        notified: 'created',
        start: null
      };
      
      const response = await axios.post(
        `${API_URL}milestones`,
        emptyMilestone,
        { headers: API_HEADERS }
      );
      
      // Получаем созданную запись с id от сервера
      const createdMilestone = response.data[0] || response.data;
      
      // Обогащаем данными для отображения
      const milestoneWithThesis = {
        ...createdMilestone,
        thesis_title: '—'
      };
      
      const updatedData = [milestoneWithThesis, ...data];
      setData(updatedData);
      setDisplay(updatedData);
      setIsEditing(true);
      setSelectedRows([createdMilestone.id]);
      
      console.log('✅ Новый milestone добавлен для редактирования');
    } catch (err) {
      console.error('❌ Ошибка при добавлении milestone:', err);
      alert('Ошибка при добавлении: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBack = async () => {
    if (selectedRows.length > 0) {
      if (confirm('You want to cancel editing? Unsaved changes will be lost.')) {
        try {
          // Удаляем выбранные записи из базы данных
          await Promise.all(
            selectedRows.map(id =>
              axios.delete(`${API_URL}milestones?id=eq.${id}`, { headers: API_HEADERS })
            )
          );
          
          // Обновляем локальное состояние
          const updatedData = data.filter(item => !selectedRows.includes(item.id));
          const updatedDisplay = display.filter(item => !selectedRows.includes(item.id));
          
          setData(updatedData);
          setDisplay(updatedDisplay);
          setIsEditing(false);
          setSelectedRows([]);
          
          console.log('✅ Редактирование отменено, несохраненные данные удалены');
        } catch (err) {
          console.error('❌ Ошибка при отмене редактирования:', err);
          alert('Ошибка при отмене: ' + (err.response?.data?.message || err.message));
        }
      }
    } else {
      setIsEditing(false);
      setSelectedRows([]);
    }
  };

  const handleDeleteMilestones = async () => {
    if (selectedRows.length === 0) {
      alert('Выберите milestones для удаления');
      return;
    }
    if (!confirm(`Удалить ${selectedRows.length} выбранных milestones?`)) {
      return;
    }
    try {
      await Promise.all(
        selectedRows.map(id =>
          axios.delete(`${API_URL}milestones?id=eq.${id}`, { headers: API_HEADERS })
        )
      );
      setDisplay(display.filter(item => !selectedRows.includes(item.id)));
      setData(data.filter(item => !selectedRows.includes(item.id)));
      setIsEditing(false);
      setSelectedRows([]);
    } catch (err) {
      console.error('Ошибка при удалении milestones:', err);
      alert('Ошибка при удалении milestones: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCellEdit = (recordId, field, value) => {
    const updatedData = data.map(item =>
      item.id === recordId ? { ...item, [field]: value } : item
    );
    setData(updatedData);
    setDisplay(updatedData);
  };

  const handleSaveSelectedMilestones = async () => {
    if (selectedRows.length === 0) {
      alert('Выберите milestones для сохранения');
      return;
    }
    try {
      const selectedMilestones = data.filter(item => selectedRows.includes(item.id));
      const invalidMilestones = selectedMilestones.filter(milestone =>
        !milestone.title || !milestone.thesis_id
      );
      if (invalidMilestones.length > 0) {
        alert('Пожалуйста, заполните все обязательные поля: Title, Thesis');
        return;
      }
      
      for (const milestone of selectedMilestones) {
        const updateData = {
          thesis_id: milestone.thesis_id,
          title: milestone.title,
          description: milestone.description,
          deadline: milestone.deadline,
          weight: milestone.weight,
          status: milestone.status,
          notified: milestone.notified,
          start: milestone.start
        };
        
        await axios.patch(
          `${API_URL}milestones?id=eq.${milestone.id}`,
          updateData,
          { headers: API_HEADERS }
        );
      }
      
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
      
      console.log('✅ Milestones успешно сохранены');
    } catch (err) {
      console.error('❌ Ошибка при сохранении milestones:', err);
      alert('Ошибка при сохранении: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error :(</div>;

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
          onEdit={() => setIsEditing(true)}
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
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <TextArea
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'description', e.target.value)}
                    placeholder="Enter description"
                    rows={2}
                  />
                ) : (
                  text || '—'
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
                    value={text ? new Date(text) : null}
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
                    value={text ? new Date(text) : null}
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