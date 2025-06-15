import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import './index.css';

const { Column } = Table;

function StudentList() {
  const [data, setData]     = useState([]);
  const [error, setError]   = useState(false);
  const [loading, setLoading]= useState(true);

  const getData = () => {
    axios.get('https://jsonplaceholder.typicode.com/users')
      .then(res => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getData();
  }, []); // <- вызов только при mount

  if (loading) return <div>Loading…</div>;
  if (error)   return <div>Error:(</div>;

  return (
    <div>
      <Table dataSource={data}>
        <Column title="Name"     dataIndex="name"     key="name"     className="table_name" />
        <Column title="Email"    dataIndex="email"    key="email" />
        <Column title="Phone"    dataIndex="phone"    key="phone" />
        <Column title="Username" dataIndex="username" key="username" />
      </Table>
    </div>
  );
}

export default StudentList;
