import {Table} from 'antd';
import './index.css';
import StudentProfile from "./studentProfile.jsx";
import React, {useEffect, useState} from "react";
import ControlPanel from "./control-panel.jsx";
import {
  studentsService,
  usersService,
  supervisorsService,
  groupsService,
  thesesService
} from '@/api/services';

const { Column } = Table;

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
                const [student, users, supervisors, groups, theses] = await Promise.all([
                    studentsService.getAll(),
                    usersService.getAll(),
                    supervisorsService.getAll(),
                    groupsService.getAll(),
                    thesesService.getAll(),
                ])

                const idToName = users.filter(u => u.role === 'supervisor').reduce((m, u) => {
                    m[u.id] = `${u.first_name} ${u.last_name}`;
                    return m;
                }, {});
                const enriched = enrichStudents(student, users, supervisors, groups, theses);

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
            await studentsService.deleteMany(selectedRows);
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
                await studentsService.deleteMany(deletedIds);
            }
            for (const student of display) {
                const originalStudent = data.find(s => s.id === student.id);
                if (originalStudent && (
                    student.studentName !== originalStudent.studentName ||
                    student.studentSurname !== originalStudent.studentSurname ||
                    student.program !== originalStudent.program ||
                    student.department !== originalStudent.department ||
                    student.year !== originalStudent.year
                )) {
                    await usersService.update(student.user_id, {
                        first_name: student.studentName,
                        last_name: student.studentSurname
                    });
                    await studentsService.update(student.id, {
                        program: student.program,
                        department: student.department,
                        year: student.year
                    });
                }
            }
            const [student, users, supervisors, groups, theses] = await Promise.all([
                studentsService.getAll(),
                usersService.getAll(),
                supervisorsService.getAll(),
                groupsService.getAll(),
                thesesService.getAll(),
            ]);
            const idToName = users.filter(u => u.role === 'supervisor').reduce((m, u) => {
                m[u.id] = `${u.first_name} ${u.last_name}`;
                return m;
            }, {});
            const enriched = enrichStudents(student, users, supervisors, groups, theses);
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




