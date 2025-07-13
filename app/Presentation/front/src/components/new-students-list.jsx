import axios from 'axios';
import { Table, Input, Select } from 'antd';
import './index.css';
import React, {useEffect, useState} from "react";
import ControlPanel from "./control-panel.jsx";

const { Column } = Table;

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function NewStudentList({ onBackToMenu }){
    const [data, setData] = useState([]);
    const [display, setDisplay] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [years, setYears] = useState([]);
    const [supervisorNameToId, setSupervisorNameToId] = useState({});
    const [groupNameToId, setGroupNameToId] = useState({});

    useEffect(() => {
        async function fetchAll(){
            try{
                const [newStudentsData, supervisorsData, groupsData] = await Promise.all([
                    axios.get(API_URL + 'new_students', {headers: API_HEADERS}),
                    axios.get(API_URL + 'supervisors', {headers: API_HEADERS}),
                    axios.get(API_URL + 'peer_groups', {headers: API_HEADERS}),
                ])

                const newStudents = newStudentsData.data;
                const supervisors = supervisorsData.data;
                const peerGroups = groupsData.data;

                // Создаем мапы для быстрого поиска ID по именам
                const supervisorNameToId = {};
                const groupNameToId = {};

                // Загружаем данные пользователей для супервизоров
                const usersResponse = await axios.get(API_URL + 'users', {headers: API_HEADERS});
                const users = usersResponse.data;

                supervisors.forEach(supervisor => {
                    const user = users.find(u => u.id === supervisor.user_id);
                    if (user) {
                        const supervisorName = `${user.first_name} ${user.last_name}`.trim();
                        supervisorNameToId[supervisorName] = supervisor.id;
                    }
                });

                peerGroups.forEach(group => {
                    groupNameToId[group.name] = group.id;
                });

                // Сохраняем мапы в состоянии
                setSupervisorNameToId(supervisorNameToId);
                setGroupNameToId(groupNameToId);

                // Обогащаем данные студентов
                const enriched = newStudents.map(student => {
                                    // Определяем статус заполнения
                const hasEmptyFields = !student.firstname || !student.lastname || !student.group || 
                                     !student.supervisor || !student.program || !student.department || 
                                     !student.year || !student.username;
                    
                    const isAllFilled = !hasEmptyFields;
                    const isApproved = student.approved === true; // предполагаем, что есть поле approved
                    
                    let status = 'incomplete';
                    if (isAllFilled && isApproved) {
                        status = 'approved';
                    } else if (isAllFilled) {
                        status = 'filled';
                    }

                    return {
                        ...student,
                        status: status,
                        statusText: status === 'incomplete' ? 'Empty' : 
                                   status === 'filled' ? 'Filled' : 'Done'
                    };
                });

                setData(enriched);
                setDisplay(enriched);

                // Уникальные значения для фильтров
                const uniqueDepartments = [...new Set(enriched.map(s => s.department).filter(Boolean))];
                setDepartments(uniqueDepartments);

                const uniqueGroups = [...new Set(enriched.map(s => s.group).filter(Boolean))];
                setGroups(uniqueGroups);

                const uniqueSupervisors = [...new Set(enriched.map(s => s.supervisor).filter(Boolean))];
                setSupervisors(uniqueSupervisors);

                const uniqueYears = [...new Set(enriched.map(s => s.year).filter(Boolean))];
                setYears(uniqueYears);

            } catch (e){
                console.error(e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    const filterOptions = [
      {
        name: 'department',
        label: 'Department',
        options: departments.map(dep => ({ label: dep, value: dep })),
      },
      {
        name: 'group',
        label: 'Group',
        options: groups.map(g => ({ label: g, value: g })),
      },
      {
        name: 'supervisor',
        label: 'Supervisor',
        options: supervisors.map(s => ({ label: s, value: s })),
      },
      {
        name: 'year',
        label: 'Year',
        options: years.map(y => ({ label: y, value: y })),
      },
      {
        name: 'status',
        label: 'Status',
        options: [
          { label: 'Empty', value: 'incomplete' },
          { label: 'Filled', value: 'filled' },
          { label: 'Done', value: 'approved' }
        ],
      },
    ];

    const sortOptions = [
      { name: 'firstname', label: 'First Name' },
      { name: 'lastname', label: 'Last Name' },
      { name: 'department', label: 'Department' },
      { name: 'year', label: 'Year' },
      { name: 'status', label: 'Status' },
    ];

    const handleSearch = term => {
        const filtered = data.filter(item =>
            (item.firstname || '').toLowerCase().includes(term.toLowerCase()) ||
            (item.lastname || '').toLowerCase().includes(term.toLowerCase()) ||
            (item.telegram_id || '').toLowerCase().includes(term.toLowerCase()) ||
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

    const handleFilter = (filters) => {
      let result = data;
      if (filters.department) {
        result = result.filter(item => filters.department.includes(item.department));
      }
      if (filters.group) {
        result = result.filter(item => filters.group.includes(item.group));
      }
      if (filters.supervisor) {
        result = result.filter(item => filters.supervisor.includes(item.supervisor));
      }
      if (filters.year) {
        result = result.filter(item => filters.year.includes(item.year));
      }
      if (filters.status) {
        result = result.filter(item => filters.status.includes(item.status));
      }
      setDisplay(result);
    };

    const handleAddStudent = async () => {
        try {
            // Создаем пустую запись на сервере
            const emptyStudent = {
                firstname: '',
                lastname: '',
                username: '',
                supervisor: '',
                group: '',
                program: '',
                department: '',
                year: '',
                approved: false
            };
            const response = await axios.post(
                `${API_URL}new_students`,
                emptyStudent,
                { headers: API_HEADERS }
            );
            // Получаем созданную запись с id от сервера
            const createdStudent = response.data[0] || response.data;
            // Обогащаем статусом
            const hasEmptyFields = !createdStudent.firstname || !createdStudent.lastname || !createdStudent.group || 
                                   !createdStudent.supervisor || !createdStudent.program || !createdStudent.department || 
                                   !createdStudent.year || !createdStudent.username;
            const isAllFilled = !hasEmptyFields;
            const isApproved = createdStudent.approved === true;
            let status = 'incomplete';
            if (isAllFilled && isApproved) {
                status = 'approved';
            } else if (isAllFilled) {
                status = 'filled';
            }
            const studentWithStatus = {
                ...createdStudent,
                status: status,
                statusText: status === 'incomplete' ? 'Empty' : 
                           status === 'filled' ? 'Filled' : 'Done'
            };
            const updatedData = [studentWithStatus, ...data];
            setData(updatedData);
            setDisplay(updatedData);
            setIsEditing(true);
            setSelectedRows([createdStudent.id]);
            console.log('✅ Добавлен новый студент для заполнения');
        } catch (err) {
            console.error('❌ Ошибка при добавлении студента:', err);
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
                            axios.delete(`${API_URL}new_students?id=eq.${id}`, {headers: API_HEADERS})
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

    const handleDeleteStudents = async () => {
        if (selectedRows.length === 0) {
            alert('Выберите студентов для удаления');
            return;
        }

        if (!confirm(`Удалить ${selectedRows.length} выбранных студентов?`)) {
            return;
        }

        try {
            // Удаляем из new_students
            await Promise.all(
                selectedRows.map(id =>
                    axios.delete(`${API_URL}new_students?id=eq.${id}`, {headers: API_HEADERS})
                )
            );
            
            setDisplay(display.filter(item => !selectedRows.includes(item.id)));
            setData(data.filter(item => !selectedRows.includes(item.id)));
            setIsEditing(false);
            setSelectedRows([]);
            console.log('✅ Выбранные студенты успешно удалены');
        } catch (err) {
            console.error('❌ Ошибка при удалении студентов:', err);
            alert('Ошибка при удалении студентов: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCellEdit = (recordId, field, value) => {
        const updatedData = data.map(item => 
            item.id === recordId ? { ...item, [field]: value } : item
        );
        setData(updatedData);
        setDisplay(updatedData);
    };

    const handleSaveSelectedStudents = async () => {
        if (selectedRows.length === 0) {
            alert('Выберите студентов для сохранения');
            return;
        }

        try {
            const selectedStudents = data.filter(item => selectedRows.includes(item.id));
            // Проверяем обязательные поля для всех выбранных студентов
            const invalidStudents = selectedStudents.filter(student => 
                !student.firstname || !student.lastname || !student.username
            );
            if (invalidStudents.length > 0) {
                alert('Пожалуйста, заполните все обязательные поля: Имя, Фамилия, Username');
                return;
            }
            // Сохраняем каждого выбранного студента
            for (const student of selectedStudents) {
                const updateData = {
                    firstname: student.firstname,
                    lastname: student.lastname,
                    username: student.username,
                    supervisor: student.supervisor || null,
                    group: student.group || null,
                    program: student.program || null,
                    department: student.department || null,
                    year: student.year || null
                };
                await axios.patch(
                    `${API_URL}new_students?id=eq.${student.id}`,
                    updateData,
                    { headers: API_HEADERS }
                );
            }
            // Обновляем данные с сервера
            const newStudentsResponse = await axios.get(API_URL + 'new_students', {headers: API_HEADERS});
            const newStudents = newStudentsResponse.data;
            // Обогащаем данные как в fetchAll
            const enriched = newStudents.map(student => {
                const hasEmptyFields = !student.firstname || !student.lastname || !student.group || 
                                     !student.supervisor || !student.program || !student.department || 
                                     !student.year || !student.username;
                const isAllFilled = !hasEmptyFields;
                const isApproved = student.approved === true;
                let status = 'incomplete';
                if (isAllFilled && isApproved) {
                    status = 'approved';
                } else if (isAllFilled) {
                    status = 'filled';
                }
                return {
                    ...student,
                    status: status,
                    statusText: status === 'incomplete' ? 'Empty' : 
                               status === 'filled' ? 'Filled' : 'Done'
                };
            });
            setData(enriched);
            setDisplay(enriched);
            setIsEditing(false);
            setSelectedRows([]);
        } catch (err) {
            console.error('❌ Ошибка при сохранении студентов:', err);
            alert('Ошибка при сохранении: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleMove = async () => {
        try {
            // Проверяем, что все выбранные студенты одобрены
            const selectedStudents = data.filter(item => selectedRows.includes(item.id));
            const unapprovedStudents = selectedStudents.filter(student => student.status !== 'approved');
            
            if (unapprovedStudents.length > 0) {
                alert('Ошибка: Нельзя перенести неодобренных студентов. Сначала одобрите их.');
                return;
            }

            // Переносим каждого студента
            for (const student of selectedStudents) {
                try {
                    // 1. Создаем пользователя в таблице users
                    const userData = {
                        telegram_id: student.telegram_id,
                        username: student.username,
                        first_name: student.firstname,
                        last_name: student.lastname,
                        role: 'student',
                        department: student.department
                    };

                    const userResponse = await axios.put(
                        `${API_URL}users?telegram_id=eq.${student.telegram_id}`,
                        userData,
                        { headers: API_HEADERS }
                    );

                    // Получаем ID созданного пользователя
                    const createdUser = Array.isArray(userResponse.data) ? userResponse.data[0] : userResponse.data;
                    const userId = createdUser.id;

                    // 2. Создаем студента в таблице students
                    const supervisorId = supervisorNameToId[student.supervisor];
                    const groupId = groupNameToId[student.group];

                    if (!supervisorId) {
                        throw new Error(`Супервизор "${student.supervisor}" не найден`);
                    }
                    if (!groupId) {
                        throw new Error(`Группа "${student.group}" не найдена`);
                    }

                    const studentData = {
                        user_id: userId,
                        supervisor_id: supervisorId,
                        peer_group_id: groupId,
                        program: student.program,
                        department: student.department,
                        year: student.year,
                        points: 0, // начальные значения
                        progress: 0
                    };

                    await axios.post(
                        `${API_URL}students`,
                        studentData,
                        { headers: API_HEADERS }
                    );

                    console.log(`✅ Студент ${student.firstname} ${student.lastname} успешно перенесен`);
                } catch (studentError) {
                    console.error(`❌ Ошибка при переносе студента ${student.firstname} ${student.lastname}:`, studentError);
                    throw studentError;
                }
            }

            // 3. Удаляем из new_students
            await Promise.all(
                selectedRows.map(id =>
                    axios.delete(`${API_URL}new_students?id=eq.${id}`, {headers: API_HEADERS})
                )
            );
            
            setDisplay(display.filter(item => !selectedRows.includes(item.id)));
            setIsEditing(false);
            setSelectedRows([]);
            console.log('✅ Все студенты успешно перенесены');
        } catch (err) {
            console.error('❌ Ошибка при переносе студентов:', err);
            alert('Ошибка при переносе студентов: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return <div>Loading…</div>;
    }
    if (error) {
        return <div>Error:(</div>;
    }

    return (
        <main>
            <header className={"listHeader"}>
                <h1>List of New Students</h1>
            </header>
            <div className="pageContainer">
                <ControlPanel
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    onSort={handleSort}
                    onAdd={handleAddStudent}
                    onEdit={() => setIsEditing(true)}
                    onDelete={isEditing ? handleDeleteStudents : handleMove}
                    onSave={isEditing ? handleSaveSelectedStudents : null}
                    onBack={handleBack}
                    isEditing={isEditing}
                    filters={filterOptions}
                    sorts={sortOptions}
                    labels={{add: "Add Student", edit: "Edit List", delete: isEditing ? "Delete" : "Move", save: "Save"}}
                />

                <div className={"tableWrapper"}>
                    <Table
                        dataSource={display}
                        rowKey="id"
                        rowSelection={isEditing ? {
                            selectedRowKeys: selectedRows,
                            onChange: keys => setSelectedRows(keys)
                        } : null
                        }
                        pagination={false}
                        scroll={{x: 'max-content'}}
                        style={{
                            width: '100%'
                        }}
                        rowClassName={(record) => {
                            if (isEditing && selectedRows.includes(record.id)) {
                                return 'editing-row';
                            }
                            return '';
                        }}
                    >
                        <Column
                            title="Telegram Username"
                            dataIndex="username"
                            key="username"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'username', e.target.value)}
                                            placeholder="Enter username"
                                        />
                                    );
                                }
                                return text || '—';
                            }}
                        />
                        <Column 
                            title="First Name" 
                            dataIndex="firstname" 
                            key="firstname"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'firstname', e.target.value)}
                                            placeholder="Enter first name"
                                        />
                                    );
                                }
                                return text || '—';
                            }}
                        />
                        <Column 
                            title="Last Name" 
                            dataIndex="lastname" 
                            key="lastname"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'lastname', e.target.value)}
                                            placeholder="Enter last name"
                                        />
                                    );
                                }
                                return text || '—';
                            }}
                        />

                        <Column 
                            title="Supervisor" 
                            dataIndex="supervisor" 
                            key="supervisor"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Select
                                            value={text || undefined}
                                            onChange={(value) => handleCellEdit(record.id, 'supervisor', value)}
                                            placeholder="Select supervisor"
                                            allowClear
                                            style={{ width: '100%' }}
                                        >
                                            {supervisors.map(supervisor => (
                                                <Select.Option key={supervisor} value={supervisor}>
                                                    {supervisor}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    );
                                }
                                return text || '—';
                            }}
                        />
                        <Column 
                            title="Group" 
                            dataIndex="group" 
                            key="group"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Select
                                            value={text || undefined}
                                            onChange={(value) => handleCellEdit(record.id, 'group', value)}
                                            placeholder="Select group"
                                            allowClear
                                            style={{ width: '100%' }}
                                        >
                                            {groups.map(group => (
                                                <Select.Option key={group} value={group}>
                                                    {group}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    );
                                }
                                return text || '—';
                            }}
                        />
                        <Column 
                            title="Program" 
                            dataIndex="program" 
                            key="program"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'program', e.target.value)}
                                            placeholder="Enter program"
                                        />
                                    );
                                }
                                return text || '—';
                            }}
                        />
                        <Column 
                            title="Department" 
                            dataIndex="department" 
                            key="department"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'department', e.target.value)}
                                            placeholder="Enter department"
                                        />
                                    );
                                }
                                return text || '—';
                            }}
                        />
                        <Column 
                            title="Year" 
                            dataIndex="year" 
                            key="year"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'year', e.target.value)}
                                            placeholder="Enter year"
                                        />
                                    );
                                }
                                return text || '—';
                            }}
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
                                                   status === 'filled' ? '#ffa500' : '#ff6b6b',
                                    color: status === 'approved' ? '#000000' : 
                                          status === 'filled' ? '#ffffff' : '#ffffff',
                                    border: `1px solid ${status === 'approved' ? '#c3e6cb' : 
                                                       status === 'filled' ? '#ff8c00' : '#ff5252'}`
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