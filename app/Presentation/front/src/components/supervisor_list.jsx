import axios from 'axios';
import { Table } from 'antd';
import './index.css';
import SupervisorProfile from "./supervisorProfile.jsx";
import React, {useEffect, useState} from "react";
import ControlPanel from "@/components/control-panel.jsx";

const { Column } = Table;

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

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
                const [usrData, supData, grpData, stuData] = await Promise.all([
                    axios.get(API_URL + 'users', {headers: API_HEADERS}),
                    axios.get(API_URL + 'supervisors', {headers: API_HEADERS}),
                    axios.get(API_URL + 'peer_groups', {headers: API_HEADERS}),
                    axios.get(API_URL + 'students', {headers: API_HEADERS}),
                ])

                const users = usrData.data;
                const supervisors = supData.data;
                const peerGroups = grpData.data;
                const students = stuData.data;

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
                        supervisorName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || '—',
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
                selectedRows.map(id =>
                    axios.delete(`${API_URL}supervisors?id=eq.${id}`, {headers: API_HEADERS})
                )
            );
            setDisplay(display.filter(item => !selectedRows.includes(item.id)));
            setIsEditing(false);
            setSelectedRows([]);
        } catch (err) {
            console.error('Error deleting supervisors', err);
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
                    onBack={() => {
                        setIsEditing(false);
                        setSelectedRows([]);
                    }}
                    isEditing={isEditing}
                    filters={filterOptions}
                    sorts={sortOptions}
                    labels={{add: "Add Supervisor", edit: "Edit List"}}
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
                        className="table_name"
                        render={(text) => (
                            <span style={{color: 'black', cursor: 'pointer', maxWidth: "100px"}}>
                        {text}
                      </span>
                        )}
                    />
                    <Column title="Name" dataIndex="supervisorName" key="supervisorName"/>
                    <Column title="Surname" dataIndex="supervisorSurname" key="supervisorSurname"/>
                    <Column title="Department" dataIndex="department" key="department" className={"table_email"}/>
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

