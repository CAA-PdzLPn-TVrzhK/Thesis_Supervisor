import { Table, Input, Select } from 'antd';
import './index.css';
import React, { useEffect, useState } from 'react';
import ControlPanel from './control-panel.jsx';
import {
  newSupervisorsService,
  groupsService,
  usersService,
  supervisorsService
} from '@/api/services';

const { Column } = Table;

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
  const [originalDisplay, setOriginalDisplay] = useState([]); // для отката
  // users для отображения username
  const [users, setUsers] = useState([]);

  // Функция для определения статуса записи
  const getRecordStatus = (record) => {
    // username не участвует в проверке заполненности, только для отображения
    const hasEmptyFields = !record.firstname || !record.lastname || !record.departament || !record.groups;
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

  // Inline-редактирование: обновляем только display
  const handleCellEdit = (recordId, field, value) => {
    const updatedDisplay = display.map(item =>
      item.id === recordId ? { ...item, [field]: value } : item
    );
    setDisplay(updatedDisplay);
  };

  useEffect(() => {
    async function fetchAll() {
      try {
        console.log('🔍 Загружаем данные new_supervisors...');
        const [newSupervisors, peerGroups, users] = await Promise.all([
          newSupervisorsService.getAll(),
          groupsService.getAll(),
          usersService.getAll()
        ]);
        setUsers(users);

        console.log('📊 Полученные данные new_supervisors:', newSupervisors);
        console.log('📊 Полученные группы:', peerGroups);

        // enrich group names if needed
        const groupIdToName = {};
        peerGroups.forEach(group => {
          groupIdToName[group.id] = group.name;
        });

        // userId -> username
        const userIdToUsername = users.reduce((m, u) => {
          m[u.id] = u.username;
          return m;
        }, {});

        const enriched = newSupervisors.map(supervisor => {
          const statusInfo = getRecordStatus(supervisor);
          return {
            ...supervisor,
            groups: Array.isArray(supervisor.groups)
              ? supervisor.groups.map(id => groupIdToName[id] || id).join(', ')
              : supervisor.groups || '',
            username: userIdToUsername[supervisor.user_id] || '',
            status: statusInfo.status,
            statusText: statusInfo.statusText
          };
        });

        console.log('✨ Обогащенные данные:', enriched);

        setData(enriched);
        setDisplay(enriched);
        setDepartments([...new Set(enriched.map(s => s.departament).filter(Boolean))]);
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
    { name: 'departament', label: 'Department' }
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
    if (filters.departament) {
      result = result.filter(item => filters.departament.includes(item.departament));
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
        departament: '',
        approved: false
      };
      
      const createdSupervisor = await newSupervisorsService.create(emptySupervisor);
      
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

  const handleEdit = () => {
    setOriginalDisplay(display);
    setIsEditing(true);
    setSelectedRows([]);
  };

  const handleDeleteSupervisors = () => {
    if (selectedRows.length === 0) {
      alert('Выберите супервайзоров для удаления');
      return;
    }
    setDisplay(display.filter(item => !selectedRows.includes(item.id)));
    setSelectedRows([]);
  };

  const handleSaveSelectedSupervisors = async () => {
    if (selectedRows.length === 0 && display.length === data.length) {
      setIsEditing(false);
      return;
    }
    try {
      // Удаляем из БД только тех, кого нет в display
      const deletedIds = data.map(s => s.id).filter(id => !display.some(d => d.id === id));
      if (deletedIds.length > 0) {
        await newSupervisorsService.deleteMany(deletedIds);
      }
      for (const supervisor of display) {
        await newSupervisorsService.update(supervisor.id, supervisor);
      }
      const newSupervisors = await newSupervisorsService.getAll();
      setData(newSupervisors);
      setDisplay(newSupervisors);
      setIsEditing(false);
      setSelectedRows([]);
    } catch (err) {
      console.error('❌ Ошибка при сохранении супервайзеров:', err);
      alert('Ошибка при сохранении: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBack = () => {
    setDisplay(originalDisplay.length ? originalDisplay : data);
    setIsEditing(false);
    setSelectedRows([]);
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
        await newSupervisorsService.update(supervisor.id, { approved: true });
      }
      const newSupervisors = await newSupervisorsService.getAll();
      
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

  // Новый перенос супервизора
  const handleMove = async () => {
    if (selectedRows.length === 0) {
      alert('Выберите супервизоров для переноса');
      return;
    }
    try {
      // Получаем все группы из Supabase для поиска по имени
      const allGroups = await groupsService.getAll();
      console.log('ВСЕ ГРУППЫ:', allGroups);
      for (const supervisor of display.filter(item => selectedRows.includes(item.id))) {
        try {
          console.log('ПЕРЕНОСИМ СУПЕРВИЗОРА:', supervisor);
          // 1. Обновляем пользователя (users) по user_id
          await usersService.update(supervisor.user_id, {
            first_name: supervisor.firstname,
            last_name: supervisor.lastname,
            role: 'supervisor',
            department: supervisor.departament
          });
          const supervisorData = {
            user_id: supervisor.user_id,
            department: supervisor.departament
          };
          const createdSupervisor = await supervisorsService.create(supervisorData);
          console.log('ОТВЕТ ОТ POST /supervisors:', supRes.data, 'createdSupervisor:', createdSupervisor);
          // 3. Назначаем супервизора для выбранных групп по имени
          const groupNames = Array.isArray(supervisor.groups)
            ? supervisor.groups
            : (typeof supervisor.groups === 'string' && supervisor.groups.length > 0
                ? supervisor.groups.split(',').map(g => g.trim())
                : []);
          console.log('Названия групп для назначения:', groupNames);
          const newGroupIds = allGroups.filter(g => groupNames.includes(g.name)).map(g => g.id);
          console.log('ID групп для назначения:', newGroupIds);
          const currentGroupIds = allGroups.filter(g => g.supervisor_id === createdSupervisor.id).map(g => g.id);
          console.log('ID групп, у которых уже был этот supervisor:', currentGroupIds);
          const groupsToRemove = currentGroupIds.filter(id => !newGroupIds.includes(id));
          const groupsToAdd = newGroupIds.filter(id => !currentGroupIds.includes(id));
          console.log('groupsToRemove:', groupsToRemove, 'groupsToAdd:', groupsToAdd);
          for (const groupId of groupsToRemove) {
            try {
              await groupsService.update(groupId, { supervisor_id: null });
              console.log(`PATCH (remove) groupId=${groupId}:`, patchRes.data);
            } catch (e) {
              console.error(`Ошибка PATCH (remove) groupId=${groupId}:`, e?.response?.data || e);
            }
          }
          for (const groupId of groupsToAdd) {
            try {
              await groupsService.update(groupId, { supervisor_id: createdSupervisor.id });
              console.log(`PATCH (add) groupId=${groupId} supervisor_id=${createdSupervisor.id}`);
            } catch (e) {
              console.error(`Ошибка PATCH (add) groupId=${groupId}:`, e?.response?.data || e);
            }
          }
          // 4. Удаляем из new_supervisors
          await newSupervisorsService.delete(supervisor.id);
          console.log(`✅ Перенесён супервизор: ${supervisor.firstname} ${supervisor.lastname}`);
        } catch (moveErr) {
          console.error('❌ Ошибка при переносе супервизора:', moveErr, moveErr?.response?.data);
          alert('Ошибка при переносе: ' + (moveErr?.response?.data?.message || moveErr.message));
        }
      }
      // После всех переносов обновляем данные
      const newSupervisors = await newSupervisorsService.getAll();
      setData(newSupervisors);
      setDisplay(newSupervisors);
      setIsEditing(false);
      setSelectedRows([]);
    } catch (err) {
      console.error('❌ Ошибка при массовом переносе супервизоров:', err);
      alert('Ошибка при массовом переносе: ' + (err.response?.data?.message || err.message));
    }
  };

  // Кнопка Approve/Cancel для статуса
  const handleApproveToggle = (recordId, currentStatus) => {
    const updatedDisplay = display.map(item => {
      if (item.id === recordId) {
        let newApproved = item.approved;
        if (currentStatus === 'filled') {
          newApproved = true;
        } else if (currentStatus === 'approved') {
          newApproved = false;
        }
        // Пересчитываем статус
        const hasEmptyFields = !item.firstname || !item.lastname || !item.departament || !item.groups;
        const isAllFilled = !hasEmptyFields;
        const isApproved = newApproved === true;
        let status = 'incomplete';
        if (isAllFilled && isApproved) {
          status = 'approved';
        } else if (isAllFilled) {
          status = 'filled';
        }
        const statusText = status === 'incomplete' ? 'Incomplete' : status === 'filled' ? 'Filled' : 'Approved';
        return { ...item, approved: newApproved, status, statusText };
      }
      return item;
    });
    setDisplay(updatedDisplay);
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
          onEdit={handleEdit}
          onDelete={handleDeleteSupervisors}
          onSave={isEditing ? handleMove : null}
          onBack={handleBack}
          isEditing={isEditing}
          filters={filterOptions}
          sorts={sortOptions}
          labels={{edit: "Edit List", delete: "Delete", save: "Save"}}
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
            scroll={{ y: 600, x: 'max-content'}}
            style={{ width: '100%' }}
            rowClassName={record => (isEditing && selectedRows.includes(record.id) ? 'editing-row' : '')}
          >
            <Column
              title="Telegram Username"
              dataIndex="username"
              key="username"
              render={(text, record) => text || '—'}
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
              dataIndex="departament"
              key="departament"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Input
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'departament', e.target.value)}
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
                  {isEditing && status === 'filled' && (
                    <button
                      style={{ marginLeft: 8, background: '#4caf50', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                      onClick={() => handleApproveToggle(record.id, 'filled')}
                    >
                      Approve
                    </button>
                  )}
                  {isEditing && status === 'approved' && (
                    <button
                      style={{ marginLeft: 8, background: '#ff5252', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                      onClick={() => handleApproveToggle(record.id, 'approved')}
                    >
                      Cancel
                    </button>
                  )}
                </span>
              )}
            />
          </Table>
        </div>
      </div>
    </main>
  );
}
