import React from 'react';
import axios from 'axios';
import { Table } from 'antd';
import './index.css';

const { Column } = Table;

class SupervisorList extends React.Component {
  constructor(props) {
    super(props);

    // Сначала инициализируем state
    this.state = {
      data: [],
      error: false,
      loading: true,
    };

    // А теперь уже можно дернуть API
    axios
      .get('https://jsonplaceholder.typicode.com/users')
      .then(res => {
        this.setState({ data: res.data });   // ← используем res.data
      })
      .catch(() => {
        this.setState({ error: true });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const { loading, error, data } = this.state;

    if (loading) {
      return <div>Loading…</div>;
    }
    if (error) {
      return <div>Error:(</div>;
    }

    return (
      <div>
        <Table dataSource={data} rowKey="id">
          <Column
            title="Name"
            dataIndex="name"
            key="name"
            className="table_name"
          />
          <Column title="Email" dataIndex="email" key="email" />
          <Column title="Phone" dataIndex="phone" key="phone" />
          <Column title="Username" dataIndex="username" key="username" />
        </Table>
      </div>
    );
  }
}

export default SupervisorList;
