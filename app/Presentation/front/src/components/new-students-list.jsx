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
    const [originalDisplay, setOriginalDisplay] = useState([]); // для отката
    const [users, setUsers] = useState([]);

    // Функция для обновления данных после переноса
    const fetchAll = async () => {
        try{
            const [newStudentsData, supervisorsData, groupsData] = await Promise.all([
                axios.get(API_URL + 'new_students', {headers: API_HEADERS}),
                axios.get(API_URL + 'supervisors', {headers: API_HEADERS}),
                axios.get(API_URL + 'peer_groups', {headers: API_HEADERS}),
            ])
            const newStudents = newStudentsData.data;
            const supervisors = supervisorsData.data;
            const peerGroups = groupsData.data;
            const usersResponse = await axios.get(API_URL + 'users', {headers: API_HEADERS});
            const users = usersResponse.data;
            setUsers(users);
            // Создаем мапы для быстрого поиска ID по именам
            const supervisorNameToId = {};
            const groupNameToId = {};

            // Загружаем данные пользователей для супервизоров
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
            const userIdToUsername = users.reduce((m, u) => {
                m[u.id] = u.username;
                return m;
            }, {});
            const enriched = newStudents.map(student => {
                const hasEmptyFields = !student.firstname || !student.lastname || !student.group ||
                    !student.supervisor || !student.program || !student.departament ||
                    !student.year || (!student.username && !student.user_id);
                const isAllFilled = !hasEmptyFields;
                const isApproved = student.approved === true;
                let status = 'incomplete';
                if (isAllFilled && isApproved) {
                    status = 'approved';
                } else if (isAllFilled) {
                    status = 'filled';
                }
                // username: сначала из заявки, если нет — из users по user_id
                const username = student.username || (student.user_id ? userIdToUsername[student.user_id] : '');
                return {
                    ...student,
                    username,
                    status: status,
                    statusText: status === 'incomplete' ? 'Empty' :
                        status === 'filled' ? 'Filled' : 'Done'
                };
            });
            setData(enriched);
            setDisplay(enriched);
            setOriginalDisplay(enriched); // Инициализируем для отката

            // Уникальные значения для фильтров
            const uniqueDepartments = [...new Set(enriched.map(s => s.departament).filter(Boolean))];
            setDepartments(uniqueDepartments);

            const uniqueGroups = [...new Set(enriched.map(s => s.group).filter(Boolean))];
            setGroups(uniqueGroups);

            const uniqueSupervisors = [...new Set(enriched.map(s => s.supervisor).filter(Boolean))];
            setSupervisors(uniqueSupervisors);

            const uniqueYears = [...new Set(enriched.map(s => s.year).filter(Boolean))];
            setYears(uniqueYears);

        } catch (e){
            console.error('Ошибка при обновлении данных:', e);
        }
    };

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
                setUsers(users); // сохраняем пользователей в состояние

                // Обогащаем данные студентов
                const userIdToUsername = users.reduce((m, u) => {
                  m[u.id] = u.username;
                  return m;
                }, {});
                const enriched = newStudents.map(student => {
                  const hasEmptyFields = !student.firstname || !student.lastname || !student.group || 
                    !student.supervisor || !student.program || !student.departament || 
                    !student.year || (!student.username && !student.user_id);
                  const isAllFilled = !hasEmptyFields;
                  const isApproved = student.approved === true;
                  let status = 'incomplete';
                  if (isAllFilled && isApproved) {
                    status = 'approved';
                  } else if (isAllFilled) {
                    status = 'filled';
                  }
                  // username: сначала из заявки, если нет — из users по user_id
                  const username = student.username || (student.user_id ? userIdToUsername[student.user_id] : '');
                  return {
                    ...student,
                    username,
                    status: status,
                    statusText: status === 'incomplete' ? 'Empty' : 
                      status === 'filled' ? 'Filled' : 'Done'
                  };
                });

                setData(enriched);
                setDisplay(enriched);
                setOriginalDisplay(enriched); // Инициализируем для отката

                // Уникальные значения для фильтров
                const uniqueDepartments = [...new Set(enriched.map(s => s.departament).filter(Boolean))];
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
        result = result.filter(item => filters.department.includes(item.departament));
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

    const handleEdit = () => {
        setOriginalDisplay(display);
        setIsEditing(true);
        setSelectedRows([]);
    };

    const handleDeleteStudents = () => {
        if (selectedRows.length === 0) {
            alert('Выберите студентов для удаления');
            return;
        }
        setDisplay(display.filter(item => !selectedRows.includes(item.id)));
        setSelectedRows([]);
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
                const hasEmptyFields = !item.firstname || !item.lastname || !item.group ||
                    !item.supervisor || !item.program || !item.departament ||
                    !item.year || (!item.username && !item.user_id);
                const isAllFilled = !hasEmptyFields;
                const isApproved = newApproved === true;
                let status = 'incomplete';
                if (isAllFilled && isApproved) {
                    status = 'approved';
                } else if (isAllFilled) {
                    status = 'filled';
                }
                const statusText = status === 'incomplete' ? 'Empty' : status === 'filled' ? 'Filled' : 'Done';
                return { ...item, approved: newApproved, status, statusText };
            }
            return item;
        });
        setDisplay(updatedDisplay);
    };

    const handleSaveSelectedStudents = async () => {
        if (selectedRows.length === 0 && display.length === data.length) {
            setIsEditing(false);
            return;
        }
        try {
            // Удаляем из БД только тех, кого нет в display
            const deletedIds = data.map(s => s.id).filter(id => !display.some(d => d.id === id));
            if (deletedIds.length > 0) {
                await Promise.all(
                    deletedIds.map(id =>
                        axios.delete(`${API_URL}new_students?id=eq.${id}`, { headers: API_HEADERS })
                    )
                );
            }
            // Approved: отправляем в students, остальные просто сохраняем
            for (const student of display) {
                if (student.approved === true || student.status === 'approved') {
                    try {
                        // 1. Обновляем пользователя (users) по user_id
                        await axios.patch(
                            `${API_URL}users?id=eq.${student.user_id}`,
                            {
                                first_name: student.firstname,
                                last_name: student.lastname,
                                role: 'student',
                                department: student.departament // department, не departament
                            },
                            { headers: API_HEADERS }
                        );
                        // 2. Создаём запись в students
                        const supervisorId = supervisorNameToId[student.supervisor];
                        if (!supervisorId) {
                            alert(`Супервизор "${student.supervisor}" не найден. Заявка не перенесена.`);
                            console.log(`Ошибка: не найден supervisor для ${student.firstname} ${student.lastname}`);
                            continue;
                        }
                        const groupId = groupNameToId[student.group];
                        if (!groupId) {
                            alert(`Группа "${student.group}" не найдена. Заявка не перенесена.`);
                            console.log(`Ошибка: не найдена группа для ${student.firstname} ${student.lastname}`);
                            continue;
                        }
                        const studentData = {
                            user_id: student.user_id,
                            supervisor_id: supervisorId,
                            peer_group_id: groupId,
                            program: student.program,
                            department: student.departament,
                            year: student.year,
                            points: 0,
                            progress: 0
                        };
                        const studentRes = await axios.post(
                            `${API_URL}students`,
                            studentData,
                            { headers: API_HEADERS }
                        );
                        const createdStudent = Array.isArray(studentRes.data) ? studentRes.data[0] : studentRes.data;
                        // 3. Создаём thesis для этого студента (student_id)
                        const today = new Date();
                        const startDate = student.start_date || today.toISOString();
                        const endDate = student.end_date || new Date(today.getFullYear(), today.getMonth() + 4, today.getDate()).toISOString();
                        const thesisData = {
                            student_id: createdStudent.id, // id из students
                            supervisor_id: supervisorId,
                            title: student.thesis_title || '',
                            description: student.thesis_description || '',
                            status: 'draft',
                            start_date: startDate,
                            end_date: endDate
                        };
                        await axios.post(
                            `${API_URL}theses`,
                            thesisData,
                            { headers: API_HEADERS }
                        );
                        // Удаляем из new_students
                        await axios.delete(`${API_URL}new_students?id=eq.${student.id}`, { headers: API_HEADERS });
                        console.log(`✅ Перенесён студент: ${student.firstname} ${student.lastname}`);
                    } catch (moveErr) {
                        console.error('❌ Ошибка при переносе студента:', moveErr, moveErr?.response?.data);
                        alert('Ошибка при переносе: ' + (moveErr?.response?.data?.message || moveErr.message));
                    }
                } else {
                    // Просто сохраняем изменения в new_students
                    await axios.patch(
                        `${API_URL}new_students?id=eq.${student.id}`,
                        student,
                        { headers: API_HEADERS }
                    );
                }
            }
            // После всех переносов явно обновляем данные
            await fetchAll();
            setIsEditing(false);
            setSelectedRows([]);
            return;
        } catch (err) {
            console.error('❌ Ошибка при сохранении студентов:', err);
            alert('Ошибка при сохранении: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleBack = () => {
        setDisplay(originalDisplay.length ? originalDisplay : data);
        setIsEditing(false);
        setSelectedRows([]);
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
                        first_name: student.firstname,
                        last_name: student.lastname,
                        role: 'student',
                        departament: student.departament
                    };

                    const userResponse = await axios.put(
                        `${API_URL}users?telegram_id=eq.${student.telegram_id}`,
                        userData,
                        { headers: API_HEADERS }
                    );

                    // Получаем ID созданного пользователя
                    const createdUser = Array.isArray(userResponse.data) ? userResponse.data[0] : userResponse.data;
                    const userId = createdUser.id;

                    // 2. Создаем thesis для этого студента
                    const supervisorId = supervisorNameToId[student.supervisor];

                    if (!supervisorId) {
                        throw new Error(`Супервизор "${student.supervisor}" не найден`);
                    }
                    const thesisData = {
                        user_id: userId,
                        supervisor_id: supervisorId,
                        title: student.title || '',
                        description: student.description || '',
                        status: 'draft',
                        start_date: student.start_date || null,
                        end_date: student.end_date || null
                    };
                    const thesisResponse = await axios.post(
                        `${API_URL}theses`,
                        thesisData,
                        { headers: API_HEADERS }
                    );
                    const createdThesis = Array.isArray(thesisResponse.data) ? thesisResponse.data[0] : thesisResponse.data;
                    const thesisId = createdThesis.id;

                    // 3. Создаем студента в таблице students
                    const groupId = groupNameToId[student.group];
                    if (!groupId) {
                        throw new Error(`Группа "${student.group}" не найдена`);
                    }
                    const studentData = {
                        user_id: userId,
                        supervisor_id: supervisorId,
                        thesis_id: thesisId,
                        peer_group_id: groupId,
                        program: student.program,
                        department: student.departament,
                        year: student.year,
                        points: 0, // начальные значения
                        progress: 0
                    };
                    await axios.post(
                        `${API_URL}students`,
                        studentData,
                        { headers: API_HEADERS }
                    );

                    console.log(`✅ Студент ${student.firstname} ${student.lastname} и thesis успешно перенесены`);
                } catch (studentError) {
                    console.error(`❌ Ошибка при переносе студента ${student.firstname} ${student.lastname}:`, studentError);
                    throw studentError;
                }
            }

            // 4. Удаляем из new_students
            await Promise.all(
                selectedRows.map(id =>
                    axios.delete(`${API_URL}new_students?id=eq.${id}`, {headers: API_HEADERS})
                )
            );
            
            setDisplay(display.filter(item => !selectedRows.includes(item.id)));
            setIsEditing(false);
            setSelectedRows([]);
            console.log('✅ Все студенты и их theses успешно перенесены');
        } catch (err) {
            console.error('❌ Ошибка при переносе студентов:', err);
            alert('Ошибка при переносе студентов: ' + (err.response?.data?.message || err.message));
        }
    };

    // Inline-редактирование: обновляем только display
    const handleCellEdit = (recordId, field, value) => {
        const updatedDisplay = display.map(item =>
            item.id === recordId ? { ...item, [field]: value } : item
        );
        setDisplay(updatedDisplay);
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
                    onEdit={handleEdit}
                    onDelete={handleDeleteStudents}
                    onSave={isEditing ? handleSaveSelectedStudents : null}
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
                        scroll={{x: 'max-content'}}
                        style={{width: '100%'}}
                        rowClassName={record => (isEditing && selectedRows.includes(record.id) ? 'editing-row' : '')}
                    >
                        <Column
                            title="Telegram Username"
                            dataIndex="username"
                            key="username"
                            render={(text, record) => {
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
                            dataIndex="departament" 
                            key="departament"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'departament', e.target.value)}
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
                            title="Thesis title" 
                            dataIndex="thesis_title" 
                            key="thesis_title"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'thesis_title', e.target.value)}
                                            placeholder="Enter thesis title"
                                        />
                                    );
                                }
                                return text || '—';
                            }}
                        />
                        <Column 
                            title="Thesis description" 
                            dataIndex="thesis_description" 
                            key="thesis_description"
                            render={(text, record) => {
                                if (isEditing && selectedRows.includes(record.id)) {
                                    return (
                                        <Input
                                            value={text || ''}
                                            onChange={(e) => handleCellEdit(record.id, 'thesis_description', e.target.value)}
                                            placeholder="Enter thesis description"
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