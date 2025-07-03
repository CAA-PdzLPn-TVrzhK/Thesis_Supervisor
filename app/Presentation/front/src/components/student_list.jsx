import axios from 'axios';
import {Table} from 'antd';
import './index.css';
import StudentProfile from "./studentProfile.jsx";
import React, {useEffect, useState} from "react";
import ControlPanel from "./control-panel.jsx"
import MainPage from "@/main_page.jsx";

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
                    m[u.id] = `${u.first_name} ${u.last_name}`;
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


                const enriched = student.map(st => {
                    const uId = supToUserMap[st.supervisor_id];
                    return {
                      ...st,
                      supervisorName: idToName[uId] || '—',
                      studentName: stdToNAmeMap[st.user_id] || '—',
                      groupName: grpToStdMap[st.peer_group_id] || '—',
                        thesisName: thssIdToName[st.thesis_id] || '—',
                    };
                });

                setData(enriched);
                setDisplay(enriched);

                const uniqueGroups = [...new Set(groups.map(g => g.name))].filter(Boolean);
                setGroups(uniqueGroups);

                const uniqueYears = [...new Set(student.map(s => s.year))].filter(Boolean);
                setYear(uniqueYears);
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
        options: groups.map(g => ({ label: g, value: g })),
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
        result = result.filter(item => filters.group.includes(item.group));
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
                    axios.delete(`${API_URL}?id=eq.${id}`, {headers: API_HEADERS})
                )
            );
            setDisplay(display.filter(item => !selectedRows.includes(item.id)));
            setIsEditing(false);
            setSelectedRows([]);
        } catch (err) {
            console.error('Error deleting students', err);
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
        />
    }
    return (
        <main>
            <header>
                <div className={"listHeader"}>
                    <h1>List of Students</h1>
                </div>
            </header>
            <div className="pageContainer">
                <ControlPanel
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    onSort={handleSort}
                    onAdd={() => {setCurrent('add')}}
                    onEditMode={() => setIsEditing(true)}
                    filters={filterOptions}
                    sorts={sortOptions}

                />
                {isEditing && (
                    <div className="editPanel">
                        <button onClick={handleDelete} className="upperButton">Delete</button>
                        <button onClick={() => {
                            setIsEditing(false);
                            setSelectedRows([]);
                        }} className="upperButton">Back
                        </button>
                    </div>
                )}

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
                            title="ID"
                            dataIndex="id"
                            key="id"
                            onCell={() => ({style: {maxWidth: '295px'}})}
                            render={(text) => (
                                <span style={{color: 'black', cursor: 'pointer'}}>
                            {text}
                          </span>
                            )}
                        />
                        <Column title="Full Name" dataIndex="studentName" key="FullName"
                                onCell={() => ({style: {maxWidth: '300px'}})}/>
                        <Column title="Supervisor" dataIndex="supervisorName" key="supervisorName"/>
                        <Column title="Program" dataIndex="program" key="program"/>
                        <Column title="Department" dataIndex="department" key="department"
                                onCell={() => ({style: {minWidth: 120}})}/>
                        <Column title="Year" dataIndex="year" key="year" onCell={() => ({style: {minWidth: 60}})}/>
                        <Column title="Thesis" dataIndex="thesisName" key="thesisName"
                                onCell={() => ({style: {minWidth: '70px'}})}/>
                        <Column title="Points" dataIndex="points" key="points"
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




