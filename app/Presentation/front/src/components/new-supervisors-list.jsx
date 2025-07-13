import axios from 'axios';
import { Table, Input, Select } from 'antd';
import './index.css';
import React, { useEffect, useState } from 'react';
import ControlPanel from './control-panel.jsx';

const { Column } = Table;

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function NewSupervisorsList({ onBackToMenu }) {
  const [data, setData] = useState([]);
  const [display, setDisplay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupIdToName, setGroupIdToName] = useState({});

  // Функция для определения статуса записи
  const getRecordStatus = (record) => {
    const hasEmptyFields = !record.firstname || !record.lastname || !record.username || 
                          !record.department || !record.groups;
    const isAllFilled = !hasEmptyFields;
    const isApproved = record.approved === true;
    
    if (isAllFilled && isApproved) {
      return { status: 'approved', statusText: 'Approved' };
    } else if (isAllFilled) {
      return { status: 'filled', statusText: 'Filled' };
    } else {
      return { status: 'incomplete', statusText: 'Incomplete' };
    }
  };

  // Функция для проверки, можно ли одобрить выбранные записи
  const canApproveSelected = () => {
    const selectedSupervisors = data.filter(item => selectedRows.includes(item.id));
    return selectedSupervisors.every(supervisor => {
      const status = getRecordStatus(supervisor);
      return status.status === 'filled';
    });
  };

  useEffect(() => {
    async function fetchAll() {
      try {
        console.log('🔍 Загружаем данные new_supervisors...');
        const [newSupervisorsData, groupsData] = await Promise.all([
          axios.get(API_URL + 'new_supervisors', { headers: API_HEADERS }),
          axios.get(API_URL + 'peer_groups', { headers: API_HEADERS })
        ]);
        const newSupervisors = newSupervisorsData.data;
        const peerGroups = groupsData.data;

        console.log('📊 Полученные данные new_supervisors:', newSupervisors);
        console.log('📊 Полученные группы:', peerGroups);

        // enrich group names if needed
        const groupIdToName = {};
        peerGroups.forEach(group => {
          groupIdToName[group.id] = group.name;
        });

        const enriched = newSupervisors.map(supervisor => {
          const statusInfo = getRecordStatus(supervisor);
          return {
            ...supervisor,
            groups: Array.isArray(supervisor.groups)
              ? supervisor.groups.map(id => groupIdToName[id] || id).join(', ')
              : supervisor.groups || '',
            status: statusInfo.status,
            statusText: statusInfo.statusText
          };
        });

        console.log('✨ Обогащенные данные:', enriched);

        setData(enriched);
        setDisplay(enriched);
        setDepartments([...new Set(enriched.map(s => s.department).filter(Boolean))]);
        setGroups([...new Set(peerGroups.map(g => g.name))]);
        setGroupIdToName(groupIdToName);
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
      name: 'departament',
      label: 'Department',
      options: departments.map(dep => ({ label: dep, value: dep }))
    },
    {
      name: 'groups',
      label: 'Groups',
      options: groups.map(g => ({ label: g, value: g }))
    }
  ];

  const sortOptions = [
    { name: 'firstname', label: 'First Name' },
    { name: 'lastname', label: 'Last Name' },
    { name: 'department', label: 'Department' }
  ];

  const handleSearch = term => {
    const filtered = data.filter(item =>
      (item.firstname || '').toLowerCase().includes(term.toLowerCase()) ||
      (item.lastname || '').toLowerCase().includes(term.toLowerCase()) ||
      (item.username || '').toLowerCase().includes(term.toLowerCase())
    );
    setDisplay(filtered);
  };

  const handleSort = ({ field, order }) => {
    const sorted = [...display].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });
    setDisplay(sorted);
  };

  const handleFilter = filters => {
    let result = data;
    if (filters.department) {
      result = result.filter(item => filters.department.includes(item.department));
    }
    if (filters.groups) {
      result = result.filter(item => {
        if (!item.groups) return false;
        return filters.groups.some(g => item.groups.split(', ').includes(g));
      });
    }
    setDisplay(result);
  };

  const handleAddSupervisor = async () => {
    try {
      // Создаем пустую запись на сервере
      const emptySupervisor = {
        firstname: '',
        lastname: '',
        username: '',
        groups: [],
        department: '',
        approved: false
      };
      
      const response = await axios.post(
        `${API_URL}new_supervisors`,
        emptySupervisor,
        { headers: API_HEADERS }
      );
      
      // Получаем созданную запись с id от сервера
      const createdSupervisor = response.data[0] || response.data;
      
      // Обогащаем данными для отображения
      const statusInfo = getRecordStatus(createdSupervisor);
      const supervisorWithStatus = {
        ...createdSupervisor,
        groups: Array.isArray(createdSupervisor.groups) 
          ? createdSupervisor.groups.join(', ') 
          : createdSupervisor.groups || '',
        status: statusInfo.status,
        statusText: statusInfo.statusText
      };
      
      const updatedData = [supervisorWithStatus, ...data];
      setData(updatedData);
      setDisplay(updatedData);
      setIsEditing(true);
      setSelectedRows([createdSupervisor.id]);
      
      console.log('✅ Новый супервизор добавлен для редактирования');
    } catch (err) {
      console.error('❌ Ошибка при добавлении супервизора:', err);
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
              axios.delete(`${API_URL}new_supervisors?id=eq.${id}`, { headers: API_HEADERS })
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

  const handleDeleteSupervisors = async () => {
    if (selectedRows.length === 0) {
      alert('Выберите супервизоров для удаления');
      return;
    }
    if (!confirm(`Удалить ${selectedRows.length} выбранных супервизоров?`)) {
      return;
    }
    try {
      await Promise.all(
        selectedRows.map(id =>
          axios.delete(`${API_URL}new_supervisors?id=eq.${id}`, { headers: API_HEADERS })
        )
      );
      setDisplay(display.filter(item => !selectedRows.includes(item.id)));
      setData(data.filter(item => !selectedRows.includes(item.id)));
      setIsEditing(false);
      setSelectedRows([]);
    } catch (err) {
      console.error('Ошибка при удалении супервизоров:', err);
      alert('Ошибка при удалении супервизоров: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCellEdit = (recordId, field, value) => {
    const updatedData = data.map(item => {
      if (item.id === recordId) {
        const updatedItem = { ...item, [field]: value };
        const statusInfo = getRecordStatus(updatedItem);
        return {
          ...updatedItem,
          status: statusInfo.status,
          statusText: statusInfo.statusText
        };
      }
      return item;
    });
    setData(updatedData);
    setDisplay(updatedData);
  };

  const handleSaveSelectedSupervisors = async () => {
    if (selectedRows.length === 0) {
      alert('Выберите супервизоров для сохранения');
      return;
    }
    try {
      const selectedSupervisors = data.filter(item => selectedRows.includes(item.id));
      const invalidSupervisors = selectedSupervisors.filter(supervisor =>
        !supervisor.firstname || !supervisor.lastname || !supervisor.username
      );
      if (invalidSupervisors.length > 0) {
        alert('Пожалуйста, заполните все обязательные поля: Имя, Фамилия, Username');
        return;
      }
      
      for (const supervisor of selectedSupervisors) {
        const updateData = {
          first_name: supervisor.firstname,
          last_name: supervisor.lastname,
          username: supervisor.username,
          groups: supervisor.groups ? supervisor.groups.split(',').map(g => g.trim()) : [],
          department: supervisor.department
        };
        
        await axios.patch(
          `${API_URL}new_supervisors?id=eq.${supervisor.id}`,
          updateData,
          { headers: API_HEADERS }
        );
      }
      
      // Обновляем данные с сервера
      const newSupervisorsResponse = await axios.get(API_URL + 'new_supervisors', { headers: API_HEADERS });
      const newSupervisors = newSupervisorsResponse.data;
      
      const enriched = newSupervisors.map(supervisor => {
        const statusInfo = getRecordStatus(supervisor);
        return {
          ...supervisor,
          groups: Array.isArray(supervisor.groups)
            ? supervisor.groups.map(id => groupIdToName[id] || id).join(', ')
            : supervisor.groups || '',
          status: statusInfo.status,
          statusText: statusInfo.statusText
        };
      });

      setData(enriched);
      setDisplay(enriched);
      setIsEditing(false);
      setSelectedRows([]);
      
      console.log('✅ Супервизоры успешно сохранены');
    } catch (err) {
      console.error('❌ Ошибка при сохранении супервизоров:', err);
      alert('Ошибка при сохранении: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async () => {
    if (selectedRows.length === 0) {
      alert('Выберите супервизоров для одобрения');
      return;
    }
    
    if (!canApproveSelected()) {
      alert('Можно одобрять только полностью заполненных супервизоров');
      return;
    }

    try {
      const selectedSupervisors = data.filter(item => selectedRows.includes(item.id));
      
      for (const supervisor of selectedSupervisors) {
        await axios.patch(
          `${API_URL}new_supervisors?id=eq.${supervisor.id}`,
          { approved: true },
          { headers: API_HEADERS }
        );
      }

      // Обновляем данные с сервера
      const newSupervisorsResponse = await axios.get(API_URL + 'new_supervisors', { headers: API_HEADERS });
      const newSupervisors = newSupervisorsResponse.data;
      
      const enriched = newSupervisors.map(supervisor => {
        const statusInfo = getRecordStatus(supervisor);
        return {
          ...supervisor,
          groups: Array.isArray(supervisor.groups)
            ? supervisor.groups.map(id => groupIdToName[id] || id).join(', ')
            : supervisor.groups || '',
          status: statusInfo.status,
          statusText: statusInfo.statusText
        };
      });

      setData(enriched);
      setDisplay(enriched);
      setIsEditing(false);
      setSelectedRows([]);
      
      console.log('✅ Супервизоры успешно одобрены');
    } catch (err) {
      console.error('❌ Ошибка при одобрении супервизоров:', err);
      alert('Ошибка при одобрении: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error :(</div>;

  return (
    <main>
      <header className={"listHeader"}>
        <h1>List of New Supervisors</h1>
      </header>
      <div className="pageContainer">
        <ControlPanel
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
          onAdd={handleAddSupervisor}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDeleteSupervisors}
          onSave={isEditing ? (canApproveSelected() ? handleApprove : handleSaveSelectedSupervisors) : null}
          onBack={handleBack}
          isEditing={isEditing}
          filters={filterOptions}
          sorts={sortOptions}
          labels={{ 
            add: "Add Supervisor", 
            edit: "Edit List", 
            delete: "Delete", 
            save: canApproveSelected() ? "Approve" : "Save" 
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
              title="Telegram Username"
              dataIndex="username"
              key="username"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Input
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'username', e.target.value)}
                    placeholder="Enter username"
                  />
                ) : (
                  text || '—'
                )
              }
            />
            <Column
              title="First Name"
              dataIndex="firstname"
              key="firstname"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Input
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'firstname', e.target.value)}
                    placeholder="Enter first name"
                  />
                ) : (
                  text || '—'
                )
              }
            />
            <Column
              title="Last Name"
              dataIndex="lastname"
              key="lastname"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Input
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'lastname', e.target.value)}
                    placeholder="Enter last name"
                  />
                ) : (
                  text || '—'
                )
              }
            />
            <Column
              title="Groups"
              dataIndex="groups"
              key="groups"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Select
                    mode="multiple"
                    value={text ? text.split(',').map(g => g.trim()) : []}
                    onChange={values => handleCellEdit(record.id, 'groups', values.join(', '))}
                    placeholder="Select groups"
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {groups.map(group => (
                      <Select.Option key={group} value={group}>
                        {group}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  text || '—'
                )
              }
            />
            <Column
              title="Department"
              dataIndex="department"
              key="department"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Input
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'department', e.target.value)}
                    placeholder="Enter department"
                  />
                ) : (
                  text || '—'
                )
              }
            />
            <Column 
              title="Status" 
              dataIndex="status" 
              key="status"
              render={(status, record) => (
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: status === 'approved' ? '#d4edda' : 
                                 status === 'filled' ? '#fff3cd' : '#f8d7da',
                  color: status === 'approved' ? '#155724' : 
                        status === 'filled' ? '#856404' : '#721c24',
                  border: `1px solid ${status === 'approved' ? '#c3e6cb' : 
                                     status === 'filled' ? '#ffeaa7' : '#f5c6cb'}`
                }}>
                  {record.statusText}
                </span>
              )}
            />
          </Table>
        </div>
      </div>
    </main>
  );
}
