import { Table } from 'antd';
import './index.css';
import SupervisorProfile from "./supervisorProfile.jsx";
import React, {useEffect, useState} from "react";
import ControlPanel from "@/components/control-panel.jsx";
import {
  usersService,
  supervisorsService,
  groupsService,
  studentsService
} from '@/api/services';

const { Column } = Table;

export default function SupervisorList(){
    const [data, setData] = useState([]);
    const [display, setDisplay] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [current, setCurrent] = useState('supervisorList');
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        async function fetchAll(){
            try{
                const [users, supervisors, peerGroups, students] = await Promise.all([
                    usersService.getAll(),
                    supervisorsService.getAll(),
                    groupsService.getAll(),
                    studentsService.getAll(),
                ])

                // enrich supervisors with user info
                const idToUser = users.reduce((m, u) => {
                    m[u.id] = u;
                    return m;
                }, {});

                const enriched = supervisors.map(sup => {
                    const user = idToUser[sup.user_id] || {};
                    // Найти группы для этого супервизора
                    const supervisorGroups = peerGroups.filter(group => group.supervisor_id === sup.id);
                    // Подсчитать количество студентов у этого супервизора
                    const studentsCount = students.filter(student => student.supervisor_id === sup.id).length;
                    
                    return {
                        ...sup,
                        supervisorName: `${user.first_name || ''}`.trim() || '—',
                        supervisorSurname: `${user.last_name || '—'}` || '—',
                        department: user.department || sup.department || '—',
                        user_id: sup.user_id,
                        supervisorTgUs: user.username || '—',
                        groups: supervisorGroups, // массив групп супервизора
                        groupsCount: supervisorGroups.length, // количество групп
                        studentsCount: studentsCount, // количество студентов
                    };
                });

                setData(enriched);
                setDisplay(enriched);
                setGroups(peerGroups);

                // unique departments for filter
                const uniqueDepartments = [...new Set(enriched.map(s => s.department).filter(Boolean))];
                setDepartments(uniqueDepartments);

                // unique groups for filter
                const allGroups = peerGroups.map(g => ({ id: g.id, name: g.name }));
                setGroups(allGroups);
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
        name: 'hasGroups',
        label: 'Has Groups',
        options: [
          { label: 'With Groups', value: true },
          { label: 'Without Groups', value: false }
        ],
      },
      {
        name: 'groups',
        label: 'Specific Groups',
        options: groups.map(g => ({ label: g.name, value: g.id })),
      },
      {
        name: 'hasStudents',
        label: 'Has Students',
        options: [
          { label: 'With Students', value: true },
          { label: 'Without Students', value: false }
        ],
      },
    ];

    const sortOptions = [
      { name: 'supervisorName', label: 'Name' },
      { name: 'supervisorTgUs', label: 'Username' },
      { name: 'department', label: 'Department' },
      { name: 'groupsCount', label: 'Groups Count' },
      { name: 'studentsCount', label: 'Students Count' },
    ];

    const handleSearch = term => {
        const filtered = data.filter(item =>
            (item.supervisorName || '').toLowerCase().includes(term.toLowerCase()) ||
            (item.supervisorTgUs || '').toLowerCase().includes(term.toLowerCase()) ||
            (item.department || '').toLowerCase().includes(term.toLowerCase())
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
      if (filters.hasGroups !== undefined) {
        result = result.filter(item => 
          filters.hasGroups ? item.groupsCount > 0 : item.groupsCount === 0
        );
      }
      if (filters.groups) {
        result = result.filter(item => 
          item.groups.some(group => filters.groups.includes(group.id))
        );
      }
      if (filters.hasStudents !== undefined) {
        result = result.filter(item => 
          filters.hasStudents ? item.studentsCount > 0 : item.studentsCount === 0
        );
      }
      setDisplay(result);
    };

    const handleDelete = async () => {
        try {
            await Promise.all(
                selectedRows.map(async id => {
                    try {
                        await groupsService.updateSupervisor(id, { supervisor_id: null });
                    } catch (e) {
                        console.error('Ошибка при сбросе supervisor_id у групп:', e?.response?.data || e);
                    }
                })
            );
            await supervisorsService.deleteMany(selectedRows);
            setDisplay(display.filter(item => !selectedRows.includes(item.id)));
            setIsEditing(false);
            setSelectedRows([]);
        } catch (err) {
            console.error('Error deleting supervisors', err);
        }
    };

    const handleSave = async () => {
        try {
            const deletedIds = data.map(s => s.id).filter(id => !display.some(d => d.id === id));
            if (deletedIds.length > 0) {
                await supervisorsService.deleteMany(deletedIds);
            }
            for (const supervisor of display) {
                const originalSupervisor = data.find(s => s.id === supervisor.id);
                if (originalSupervisor && (
                    supervisor.supervisorName !== originalSupervisor.supervisorName ||
                    supervisor.supervisorSurname !== originalSupervisor.supervisorSurname ||
                    supervisor.department !== originalSupervisor.department
                )) {
                    await usersService.update(supervisor.user_id, {
                        first_name: supervisor.supervisorName,
                        last_name: supervisor.supervisorSurname,
                        department: supervisor.department
                    });
                }
            }
            const [users, supervisors, peerGroups, students] = await Promise.all([
                usersService.getAll(),
                supervisorsService.getAll(),
                groupsService.getAll(),
                studentsService.getAll(),
            ]);
            const idToUser = users.reduce((m, u) => {
                m[u.id] = u;
                return m;
            }, {});
            const enriched = supervisors.map(sup => {
                const user = idToUser[sup.user_id] || {};
                const supervisorGroups = peerGroups.filter(group => group.supervisor_id === sup.id);
                const studentsCount = students.filter(student => student.supervisor_id === sup.id).length;
                return {
                    ...sup,
                    supervisorName: `${user.first_name || ''}`.trim() || '—',
                    supervisorSurname: `${user.last_name || '—'}` || '—',
                    department: user.department || sup.department || '—',
                    user_id: sup.user_id,
                    supervisorTgUs: user.username || '—',
                    groups: supervisorGroups,
                    groupsCount: supervisorGroups.length,
                    studentsCount: studentsCount,
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
      return <SupervisorProfile
          supervisor={current === 'profile' ? selectedSupervisor : null}
          onBack={() => setCurrent('supervisorList')}
          onSave={(updated) => {
                setDisplay(display.map(s => s.id === updated.id ? updated : s));
                setCurrent('supervisorList');
                console.log('✅ Сохранение супервизора прошло успешно:', updated);
            }}
          supervisors={data}
          groups={groups}
      />
    }
    return (
        <main>
            <header className={"listHeader"}>
                <h1>List of Supervisors</h1>
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
                    labels={{add: "Add Supervisor", edit: "Edit List", save: "Save"}}
                />

                <Table
                    dataSource={display}
                    rowKey="id"
                    rowSelection={isEditing ? {
                        selectedRowKeys: selectedRows,
                        onChange: keys => setSelectedRows(keys)
                    } : null
                    }
                    pagination={false}
                    scroll={{ y: 600, x: 'max-content'}}
                    style={{
                        width: '100%'
                    }}
                    onRow={record => ({
                        onClick: () => {
                            setCurrent('profile');
                            setSelectedSupervisor(record);
                        }
                    })}
                >
                    <Column
                        title="telegram Username"
                        dataIndex="supervisorTgUs"
                        key="supervisorTgUs"
                        render={(text) => (
                            <span style={{color: 'black', cursor: 'pointer'}}>
                        {text}
                      </span>
                        )}
                    />
                    <Column title="Name" dataIndex="supervisorName" key="supervisorName"/>
                    <Column title="Surname" dataIndex="supervisorSurname" key="supervisorSurname"/>
                    <Column title="Department" dataIndex="department" key="department"/>
                    <Column 
                            title="Groups" 
                            dataIndex="groups" 
                            key="groups"
                            render={(groups) => (
                                <div>
                                    {groups && groups.length > 0 ? (
                                        groups.map(group => (
                                            <span key={group.id} style={{ 
                                                display: 'inline-block', 
                                                margin: '2px', 
                                                padding: '2px 6px', 
                                                backgroundColor: '#f0f0f0', 
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>
                                                {group.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: '#999' }}>No groups</span>
                                    )}
                                </div>
                            )}
                        />
                    <Column 
                        title="Students Count" 
                        dataIndex="studentsCount" 
                        key="studentsCount"
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
        </main>
    );
}

