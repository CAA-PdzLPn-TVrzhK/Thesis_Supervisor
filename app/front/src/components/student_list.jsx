import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Добавьте импорт axios
import { Table } from 'antd';
import './index.css';

function StudentList() {
    const [data, setData] = useState([])
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const getData = () => {
        axios.get('https://jsonplaceholder.typicode.com/users').then(res => {
            setData(res.data);
        }).catch(() => {
            setError(true);
        }).finally(() => {
            setLoading(false);
        })
    }

    useEffect(() => {
            getData();
        })

    useEffect(() => {
        getData()
    }, [])

    if(loading) {
        <div>
            Loading:)
        </div>
    }
    if(error) {
        <div>
            Error:(
        </div>
    }

    return (
        <div>
            <Table dataSource={data}>
                <Column className="column_name" title="Name" dataIndex="name" key="name" className={"table_name"}/>
                <Column title="Email" dataIndex="email" key="email" />
                <Column title="Phone" dataIndex="phone" key="phone" />
                <Column title="Username" dataIndex="username" key="username" />
            </Table>
        </div>
    )

}

export default StudentList;