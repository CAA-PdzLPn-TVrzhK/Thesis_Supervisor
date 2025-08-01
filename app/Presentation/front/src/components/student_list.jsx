import axios from 'axios';
import {Table} from 'antd';
import './index.css';
import StudentProfile from "./studentProfile.jsx";
import React, {useEffect, useState} from "react";
import ControlPanel from "./control-panel.jsx"

const { Column } = Table;

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

export default function StudentList() {

    const [data, setData] = useState([]);
    const [display, setDisplay] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [current, setCurrent] = useState('studentList');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [groups, setGroups] = useState([]);
    const [years, setYear] = useState([]);
    const [supervisors, setSupervisors] = useState([])
    const [theses, setTheses] = useState([])

    // А теперь уже можно дернуть API
    useEffect(() => {
        async function fetchAll(){
            try{
                const [stuData, usrData, supData, grpData, thssData] = await Promise.all([
                    axios.get(API_URL + 'students', {headers: API_HEADERS}),
                    axios.get(API_URL + 'users', {headers: API_HEADERS}),
                    axios.get(API_URL + 'supervisors', {headers: API_HEADERS}),
                    axios.get(API_URL + 'peer_groups', {headers: API_HEADERS}),
                    axios.get(API_URL + 'theses', {headers: API_HEADERS}),
                ])

                const student = stuData.data;
                const users = usrData.data;
                const supervisors = supData.data;
                const groups = grpData.data;
                const theses = thssData.data;

                const supToUserMap = supervisors.reduce((m, sup) =>{
                    m[sup.id] = sup.user_id;
                    return m;
                }, {})


                const stdToNAmeMap = users.filter(u => u.role === 'student').reduce((m, u) => {
                    m[u.id] = `${u.first_name}`;
                    return m;
                }, {})

                const stdToSurnameMap = users.filter(u => u.role == 'student').reduce((m, u) => {
                    m[u.id] = `${u.last_name}`;
                    return m;
                }, {})

                const idToName = users.filter(u => u.role === 'supervisor').reduce((m, u) => {
                    m[u.id] = `${u.first_name} ${u.last_name}`;
                    return m;
                }, {})

                const grpToStdMap = groups.reduce((m, g) => {
                    m[g.id] = g.name;
                    return m;
                }, {})

                const thssIdToName = theses.reduce((m, t) => {
                    m[t.id] = t.title;
                    return m;
                }, {})

                const IdToTgUs = users.filter(u => u.role === "student").reduce((m, u) =>{
                    m[u.id] = u.username;
                    return m;
                })

                const supIdToName = supervisors.reduce((m, sup) => {
                    m[sup.id] = idToName[sup.user_id] || '—';
                    return m;
                }, {})


                const enriched = student.map(st => {
                    return {
                      ...st,
                      studentTgUs: IdToTgUs[st.user_id] || '—',
                      supervisorName: supIdToName[st.supervisor_id] || '—',
                      studentName: stdToNAmeMap[st.user_id] || '—',
                      studentSurname: stdToSurnameMap[st.user_id] || '—',
                      groupName: grpToStdMap[st.peer_group_id] || '—',
                      thesisName: thssIdToName[st.thesis_id] || '—',
                    };
                });

                setData(enriched);
                setDisplay(enriched);

                const supList = supervisors.map(sup => ({
                    id:    sup.id,
                    name:  idToName[sup.user_id] || '—'
                }))
                  
                const uniqueSupMap = supList.reduce((map, sup) => {
                    map.set(sup.name, sup)
                    return map
                }, new Map())
                  
                const uniqueSupervisors = Array.from(uniqueSupMap.values())
                  
                setSupervisors(uniqueSupervisors)

                setTheses(theses)

                // Передаем полные объекты групп с supervisor_id для фильтрации
                setGroups(groups);

                const uniqueYears = [...new Set(student.map(s => s.year))].filter(Boolean); setYear(uniqueYears);

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
        name: 'group',
        label: 'Group',
        options: groups.map(g => ({ label: g.name, value: g.id })),
      },
      {
        name: 'year',
        label: 'Year',
        options: years.map(y => ({ label: y, value: y })),
      },
    ];

    const sortOptions = [
      { name: 'id', label: 'ID' },
      { name: 'points', label: 'Points' },
      { name: 'year', label: 'Year' },
    ];

    const handleSearch = term => {
        const filtered = data.filter(item =>
            item.user_id.toString().includes(term) ||
            (item.program || '').toLowerCase().includes(term.toLowerCase()) || item.year.toString().includes(term)
        );
        setDisplay(filtered);
    };

    const handleSort = ({ field, order }) => {
      const sorted = [...display].sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        return order === 'asc' ? valA - valB : valB - valA;
      });
      setDisplay(sorted);
    };

    const handleFilter = (filters) => {
      let result = data;
      if (filters.group) {
        result = result.filter(item => filters.group.includes(item.peer_group_id));
      }
      if (filters.year) {
        result = result.filter(item => filters.year.includes(item.year));
      }
      setDisplay(result);
    };



    const handleDelete = async () => {
        try {
            await Promise.all(
                selectedRows.map(id =>
                    axios.delete(`${API_URL}students?id=eq.${id}`, {headers: API_HEADERS})
                )
            );
            setDisplay(display.filter(item => !selectedRows.includes(item.id)));
            setIsEditing(false);
            setSelectedRows([]);
        } catch (err) {
            console.error('Error deleting students', err);
        }
    };

    const handleSave = async () => {
        try {
            // Удаляем из БД только тех, кого нет в display
            const deletedIds = data.map(s => s.id).filter(id => !display.some(d => d.id === id));
            if (deletedIds.length > 0) {
                await Promise.all(
                    deletedIds.map(id =>
                        axios.delete(`${API_URL}students?id=eq.${id}`, { headers: API_HEADERS })
                    )
                );
            }
            // Обновляем изменённые записи
            for (const student of display) {
                const originalStudent = data.find(s => s.id === student.id);
                if (originalStudent && (
                    student.studentName !== originalStudent.studentName ||
                    student.studentSurname !== originalStudent.studentSurname ||
                    student.program !== originalStudent.program ||
                    student.department !== originalStudent.department ||
                    student.year !== originalStudent.year
                )) {
                    // Обновляем пользователя
                    await axios.patch(
                        `${API_URL}users?id=eq.${student.user_id}`,
                        {
                            first_name: student.studentName,
                            last_name: student.studentSurname
                        },
                        { headers: API_HEADERS }
                    );
                    // Обновляем студента
                    await axios.patch(
                        `${API_URL}students?id=eq.${student.id}`,
                        {
                            program: student.program,
                            department: student.department,
                            year: student.year
                        },
                        { headers: API_HEADERS }
                    );
                }
            }
            // Обновляем данные с сервера
            const [stuData, usrData, supData, grpData, thssData] = await Promise.all([
                axios.get(API_URL + 'students', {headers: API_HEADERS}),
                axios.get(API_URL + 'users', {headers: API_HEADERS}),
                axios.get(API_URL + 'supervisors', {headers: API_HEADERS}),
                axios.get(API_URL + 'peer_groups', {headers: API_HEADERS}),
                axios.get(API_URL + 'theses', {headers: API_HEADERS}),
            ]);
            const student = stuData.data;
            const users = usrData.data;
            const supervisors = supData.data;
            const groups = grpData.data;
            const theses = thssData.data;
            const supToUserMap = supervisors.reduce((m, sup) =>{
                m[sup.id] = sup.user_id;
                return m;
            }, {});
            const stdToNAmeMap = users.filter(u => u.role === 'student').reduce((m, u) => {
                m[u.id] = `${u.first_name}`;
                return m;
            }, {});
            const stdToSurnameMap = users.filter(u => u.role == 'student').reduce((m, u) => {
                m[u.id] = `${u.last_name}`;
                return m;
            }, {});
            const idToName = users.filter(u => u.role === 'supervisor').reduce((m, u) => {
                m[u.id] = `${u.first_name} ${u.last_name}`;
                return m;
            }, {});
            const grpToStdMap = groups.reduce((m, g) => {
                m[g.id] = g.name;
                return m;
            }, {});
            const thssIdToName = theses.reduce((m, t) => {
                m[t.id] = t.title;
                return m;
            }, {});
            const IdToTgUs = users.filter(u => u.role === "student").reduce((m, u) =>{
                m[u.id] = u.username;
                return m;
            }, {});
            const supIdToName = supervisors.reduce((m, sup) => {
                m[sup.id] = idToName[sup.user_id] || '—';
                return m;
            }, {});
            const enriched = student.map(st => {
                return {
                  ...st,
                  studentTgUs: IdToTgUs[st.user_id] || '—',
                  supervisorName: supIdToName[st.supervisor_id] || '—',
                  studentName: stdToNAmeMap[st.user_id] || '—',
                  studentSurname: stdToSurnameMap[st.user_id] || '—',
                  groupName: grpToStdMap[st.peer_group_id] || '—',
                  thesisName: thssIdToName[st.thesis_id] || '—',
                };
            });
            setData(enriched);
            setDisplay(enriched);
            setIsEditing(false);
            setSelectedRows([]);
            console.log('✅ Изменения успешно сохранены');
        } catch (err) {
            console.error('❌ Ошибка при сохранении:', err);
            alert('Ошибка при сохранении: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return <div>Loading…</div>;
    }
    if (error) {
        return <div>Error:(</div>;
    }
    if (current === "add" || current === "profile") {
        return <StudentProfile
            student={current === 'profile' ? selectedStudent : null}
            onBack={() => setCurrent('studentList')}
            onSave={(updated) => {
                setDisplay(display.map(s => s.id === updated.id ? updated : s));
                setCurrent('studentList');
            }}
            supervisors={supervisors}
            groups={groups}
            theses={theses}
        />
    }
    return (
        <main>
            <header className={"listHeader"}>
                <h1>List of Students</h1>
            </header>
            <div className="pageContainer">
                <ControlPanel
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    onSort={handleSort}
                    onAdd={() => {setCurrent('add')}}
                    onEdit={() => setIsEditing(true)}
                    onDelete={handleDelete}
                    onSave={isEditing ? handleSave : null}
                    onBack={() => {
                        setIsEditing(false);
                        setSelectedRows([]);
                    }}
                    isEditing={isEditing}
                    filters={filterOptions}
                    sorts={sortOptions}
                    labels={{add: "Add Student", edit: "Edit List", save: "Save"}}
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
                        // навигация в профиль по клику на строку
                        onRow={record => ({
                            onClick: () => {
                                setCurrent('profile');
                                setSelectedStudent(record);
                            }
                        })}
                    >
                        <Column
                            title="telegram Username"
                            dataIndex="studentTgUs"
                            key="studentTgUs"
                            onCell={() => ({style: {maxWidth: '295px'}})}
                            render={(text) => (
                                <span style={{color: 'black', cursor: 'pointer'}}>
                            {text}  
                          </span>
                            )}
                        />
                        <Column title="Name" dataIndex="studentName" key="Name"
                                onCell={() => ({style: {maxWidth: '300px'}})}/>
                        <Column title="Surname" dataIndex="studentSurname" key="Surname"
                                onCell={() => ({style: {maxWidth: '300px'}})}/>
                        <Column title="Supervisor" dataIndex="supervisorName" key="supervisorName"/>
                        <Column title="Program" dataIndex="program" key="program"/>
                        <Column title="Department" dataIndex="department" key="department"
                                onCell={() => ({style: {minWidth: 120}})}/>
                        <Column title="Year" dataIndex="year" key="year" onCell={() => ({style: {minWidth: 60}})}/>
                        <Column title="Thesis" dataIndex="thesisName" key="thesisName"
                                onCell={() => ({style: {minWidth: '70px'}})}/>
                        <Column title="Score" dataIndex="score" key="score"
                                onCell={() => ({style: {minWidth: '75px'}})}/>
                        <Column title="Progress" dataIndex="progress" key="progress"
                                onCell={() => ({style: {minWidth: '95px'}})}/>
                        <Column title="Group" dataIndex="groupName" key="group"/>
                    </Table>
                </div>
            </div>
        </main>
    );
}




