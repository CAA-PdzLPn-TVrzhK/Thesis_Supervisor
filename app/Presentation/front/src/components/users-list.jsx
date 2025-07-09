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

export default function UsersList(){
    // Сначала инициализируем state
    const [data, setData] = useState([]);
    const [display, setDisplay] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [current, setCurrent] = useState('studentList');
    const [selectedUser, setSelectedUser] = useState(null);

    // А теперь уже можно дернуть API
    useEffect(() => {
        async function fetchAll(){
            try{
                const [usrData, supData] = await Promise.all([
                    axios.get(API_URL + 'users', {headers: API_HEADERS}),
                    axios.get(API_URL + 'supervisors', {headers: API_HEADERS}),
                    axios.get(API_URL + 'peer_groups', {headers: API_HEADERS}),
                    axios.get(API_URL + 'theses', {headers: API_HEADERS}),
                ])

                const users = usrData.data;
                const supervisor = supData.data;

                const idToName = users.filter(u => u.role === 'supervisor').reduce((m, u) => {
                    m[u.id] = `${u.first_name} ${u.last_name}`;
                    return m;
                }, {})


                const enriched = supervisor.map(sp => {
                    return {
                      ...sp,
                      supervisorName: idToName[sp.user_id] || '—',
                    };
                });

                setData(enriched);
                setDisplay(enriched);

            } catch (e){
                console.error(e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

  const handleSearch = term => {
        const filtered = data.filter(item =>
            item.user_id.toString().includes(term) ||
            (item.program || '').toLowerCase().includes(term.toLowerCase())
        );
        setDisplay(filtered);
    };

    const handleSort = ({field, order}) => {
        const sorted = [...display].sort((a, b) =>
            order === 'asc' ? (a[field] - b[field]) : (b[field] - a[field])
        );
        setDisplay(sorted);
    };

    const handleFilter = ({group, year}) => {
        let result = data;
        if (group) result = result.filter(i => i.group === group);
        if (year) result = result.filter(i => i.year === year);
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
          supervisor={current === 'profile' ? selectedUser : null}
          onBack={() => setCurrent( 'supervisorList')}
          onSave={(updated) => {
                setDisplay(display.map(s => s.id === updated.id ? updated : s));
                setCurrent('supervisorList');
            }}
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
                        onEditMode={() => setIsEditing(true)}
                        labels={{add: "Add Supervisor", edit: "Edit Supervisor"}}
                    />
                    {isEditing && (
                        <div className="editPanel">
                            <button onClick={handleDelete} className="upperButton">Delete</button>
                            <button onClick={() => {setIsEditing(false); setSelectedRows([]);}} className="upperButton">Back
                            </button>
                        </div>
                    )}

                    <Table
                        dataSource={data}
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
                        // навигация в профиль по клику на строку
                        onRow={record => ({
                            onClick: () => {
                                setCurrent('profile');
                                setSelectedUser(record);
                            }
                        })}
                    >
                        <Column
                            title="ID"
                            dataIndex="id"
                            key="id"
                            className="table_name"
                            render={(text) => (
                                <span style={{color: 'black', cursor: 'pointer'}}>
                            {text}
                          </span>
                            )}
                        />
                        <Column title="Full Name" dataIndex="supervisorName" key="supervisorName"/>
                        <Column title="Department" dataIndex="department" key="department" className={"table_email"}/>
                        <Column title="User ID" dataIndex="id" key="id"/>
                    </Table>
                </div>
            </main>
  );
}

