import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Modal, Form } from 'antd';
import './index.css';
import ControlPanel from './control-panel.jsx';
import {
  groupsService,
  supervisorsService,
  usersService,
  studentsService
} from '@/api/services';

const { Column } = Table;

export default function GroupsList({ onBackToMenu }) {
  const [data, setData] = useState([]);
  const [display, setDisplay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [originalDisplay, setOriginalDisplay] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();

  // Функция для загрузки всех данных
  const fetchAll = async () => {
    try {
      const [groups, supervisorsData, users, students] = await Promise.all([
        groupsService.getAll(),
        supervisorsService.getAll(),
        usersService.getAll(),
        studentsService.getAll(),
      ]);

      // Мапа supervisor_id -> user_id
      const supervisorIdToUserId = supervisorsData.reduce((m, sup) => {
        m[sup.id] = sup.user_id;
        return m;
      }, {});
      // Мапа user_id -> имя
      const userIdToName = users.reduce((m, u) => {
        m[u.id] = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        return m;
      }, {});
      // Мапа group_id -> количество студентов
      const groupIdToStudentCount = students.reduce((m, s) => {
        if (s.peer_group_id) {
          m[s.peer_group_id] = (m[s.peer_group_id] || 0) + 1;
        }
        return m;
      }, {});

      const enriched = groups.map(g => ({
        ...g,
        supervisorName: userIdToName[supervisorIdToUserId[g.supervisor_id]] || '—',
        amountOfStudents: groupIdToStudentCount[g.id] || 0,
      }));

      setData(enriched);
      setDisplay(enriched);
      setSupervisors(supervisorsData);

      // Создаем опции для супервизоров
      const supervisorOpts = supervisorsData.map(sup => ({
        label: userIdToName[sup.user_id] || 'Unknown',
        value: sup.id
      }));
      setSupervisorOptions(supervisorOpts);
    } catch (e) {
      console.error('Ошибка при загрузке данных:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Inline-редактирование
  const handleCellEdit = (recordId, field, value) => {
    const updatedDisplay = display.map(item =>
      item.id === recordId ? { ...item, [field]: value } : item
    );
    setDisplay(updatedDisplay);
  };

  // Добавление новой группы
  const handleAddGroup = async (values) => {
    try {
      const newGroup = {
        name: values.name,
        supervisor_id: values.supervisor_id || null
      };

      const createdGroup = await groupsService.create(newGroup);
      
      // Обогащаем новую группу данными для отображения
      const supervisorName = values.supervisor_id 
        ? supervisorOptions.find(opt => opt.value === values.supervisor_id)?.label || '—'
        : '—';

      const enrichedGroup = {
        ...createdGroup,
        supervisorName: supervisorName,
        amountOfStudents: 0
      };

      const updatedData = [enrichedGroup, ...data];
      setData(updatedData);
      setDisplay(updatedData);
      setIsAddModalVisible(false);
      addForm.resetFields();
      
      console.log('✅ Группа успешно добавлена:', enrichedGroup);
    } catch (err) {
      console.error('❌ Ошибка при добавлении группы:', err);
      alert('Ошибка при добавлении группы: ' + (err.response?.data?.message || err.message));
    }
  };

  // Режим редактирования
  const handleEdit = () => {
    setOriginalDisplay(display);
    setIsEditing(true);
    setSelectedRows([]);
  };

  // Удаление групп
  const handleDeleteGroups = () => {
    if (selectedRows.length === 0) {
      alert('Выберите группы для удаления');
      return;
    }
    setDisplay(display.filter(item => !selectedRows.includes(item.id)));
    setSelectedRows([]);
  };

  // Сохранение изменений
  const handleSave = async () => {
    try {
      // Удаляем из БД только тех, кого нет в display
      const deletedIds = data.map(g => g.id).filter(id => !display.some(d => d.id === id));
      if (deletedIds.length > 0) {
        await groupsService.deleteMany(deletedIds);
      }

      for (const group of display) {
        const originalGroup = data.find(g => g.id === group.id);
        if (originalGroup && (
          group.name !== originalGroup.name || 
          group.supervisor_id !== originalGroup.supervisor_id
        )) {
          await groupsService.update(group.id, {
            name: group.name,
            supervisor_id: group.supervisor_id
          });
        }
      }

      // Обновляем данные с сервера
      await fetchAll();
      setIsEditing(false);
      setSelectedRows([]);
      
      console.log('✅ Изменения успешно сохранены');
    } catch (err) {
      console.error('❌ Ошибка при сохранении:', err);
      alert('Ошибка при сохранении: ' + (err.response?.data?.message || err.message));
    }
  };

  // Отмена изменений
  const handleBack = () => {
    setDisplay(originalDisplay.length ? originalDisplay : data);
    setIsEditing(false);
    setSelectedRows([]);
  };

  // Поиск
  const handleSearch = term => {
    const filtered = data.filter(item =>
      (item.name || '').toLowerCase().includes(term.toLowerCase())
    );
    setDisplay(filtered);
  };

  // Сортировка
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

  // Фильтрация
  const handleFilter = filters => {
    let result = data;
    if (filters.supervisor) {
      result = result.filter(item => 
        filters.supervisor.includes(item.supervisor_id) || 
        (filters.supervisor.includes('null') && !item.supervisor_id)
      );
    }
    setDisplay(result);
  };

  const filterOptions = [
    {
      name: 'supervisor',
      label: 'Supervisor',
      options: [
        { label: 'No Supervisor', value: 'null' },
        ...supervisorOptions
      ]
    }
  ];

  const sortOptions = [
    { name: 'name', label: 'Name' },
    { name: 'amountOfStudents', label: 'Students Count' }
  ];

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error :(</div>;

  return (
    <main>
      <header className="listHeader">
        <h1>Groups</h1>
      </header>
      <div className="pageContainer">
        <ControlPanel
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
          onAdd={() => setIsAddModalVisible(true)}
          onEdit={handleEdit}
          onDelete={handleDeleteGroups}
          onSave={isEditing ? handleSave : null}
          onBack={handleBack}
          isEditing={isEditing}
          filters={filterOptions}
          sorts={sortOptions}
          labels={{add: "Add Group", edit: "Edit List", delete: "Delete", save: "Save"}}
        />
        <div className="tableWrapper">
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
              title="Name" 
              dataIndex="name" 
              key="name"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Input
                    value={text || ''}
                    onChange={e => handleCellEdit(record.id, 'name', e.target.value)}
                    placeholder="Enter group name"
                  />
                ) : (
                  text || '—'
                )
              }
            />
            <Column 
              title="Supervisor" 
              dataIndex="supervisorName" 
              key="supervisorName"
              render={(text, record) =>
                isEditing && selectedRows.includes(record.id) ? (
                  <Select
                    value={record.supervisor_id || undefined}
                    onChange={value => handleCellEdit(record.id, 'supervisor_id', value)}
                    placeholder="Select supervisor"
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {supervisorOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  text || '—'
                )
              }
            />
            <Column 
              title="Amount of Students" 
              dataIndex="amountOfStudents" 
              key="amountOfStudents"
              render={(count) => (
                <span style={{ 
                  fontWeight: 'normal',
                  color: count > 0 ? '#000' : '#999'
                }}>
                  {count}
                </span>
              )}
            />
          </Table>
        </div>

        {/* Модальное окно для добавления группы */}
        <Modal
          title="Add New Group"
          open={isAddModalVisible}
          onCancel={() => {
            setIsAddModalVisible(false);
            addForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleAddGroup}
          >
            <Form.Item
              label="Group Name"
              name="name"
              rules={[{ required: true, message: 'Please enter group name' }]}
            >
              <Input placeholder="Enter group name" />
            </Form.Item>
            <Form.Item
              label="Supervisor"
              name="supervisor_id"
            >
              <Select
                placeholder="Select supervisor (optional)"
                allowClear
                options={supervisorOptions}
              />
            </Form.Item>
            <Form.Item>
              <button type="submit" className="ant-btn ant-btn-primary">
                Add Group
              </button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </main>
  );
} 