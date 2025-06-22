import axios from 'axios';
import { Table } from 'antd';
import './index.css';
import StudentProfile from "./studentProfile.jsx";
import React from "react";

const { Column } = Table;

class StudentList extends React.Component {
  constructor(props) {
    super(props);

    // Сначала инициализируем state
    this.state = {
      data: [],
      error: false,
      loading: true,
      isEditing: false,
      selectedRows: [],
      current: "studentList",
      selectedStudent: null,
    };

    // А теперь уже можно дернуть API
    axios
      .get('http://52.87.161.100:8000/users/')
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
    const { loading, error, data, current, selectedStudent } = this.state;

    if (loading) {
      return <div>Loading…</div>;
    }
    if (error) {
      return <div>Error:(</div>;
    }
    if (current === "add" || current === "profile") {
      return <StudentProfile
          student={current === 'profile' ? selectedStudent : null}
          onBack={() => this.setState({ current: 'list', selectedStudent: null })}
          onSave={newData => {
            // тут обрабатываешь newData
              //NEWDATA для бэка!!!
            this.setState({ data: [...data, newData], current: 'list', selectedStudent: null });
          }}
        />
    }
        return (
            <div className="pageContainer">
                <button
                    className="backButton"
                    onClick={() => this.props.onBackToMenu?.()}
                >
                    ← Back to menu
                </button>
                {this.state.isEditing && (
                    <div className="editPanel">
                        <button onClick={this.handleDelete}>🗑 Удалить</button>
                        <button onClick={this.handleMove}>📦 Переместить</button>
                        <button onClick={() => this.setState({isEditing: false, selectedRows: []})}>❌ Отмена</button>
                    </div>
                )}

                <Table
                    dataSource={data}
                    rowKey="id"
                    rowSelection={
                        this.state.isEditing
                            ? {
                                selectedRowKeys: this.state.selectedRows,
                                onChange: selectedRowKeys => this.setState({selectedRows: selectedRowKeys}),
                            }
                            : null
                    }
                    pagination={false}
                    scroll={{ y: 600, x: true}}
                    style={{
                        tableLayout: 'fixed',
                        width: '100%'
                    }}
                    // навигация в профиль по клику на строку
                    onRow={record => ({
                        onClick: () => this.setState({
                            current: 'profile',
                            selectedStudent: record
                        })
                    })}
                >
                    <Column
                        title="Name"
                        dataIndex="name"
                        key="name"
                        className="table_name"
                        render={(text) => (
                            <span style={{color: 'black', cursor: 'pointer'}}>
                        {text}
                      </span>
                        )}
                    />
                    <Column title="Email" dataIndex="email" key="email" className={"table_email"}/>
                    <Column title="Group" dataIndex="group" key="group"/>
                    <Column title="Supervisor" dataIndex="supervisor" key="supervisor"/>
                    <Column title="Pass\Fail" dataIndex="P/F" key="P/F"/>
                    <Column title="Score" dataIndex="score" key="score"/>
                </Table>

                <div className="buttonRow bottomButtons">
                    <button className="addButton" onClick={() => this.setState({current: "add"})}>
                        Add student
                    </button>
                    <button className="changeButton" onClick={() => this.setState({isEditing: true})}>
                        Edit student
                    </button>
                </div>
            </div>
        );
  }
}

export default StudentList;



