
import React from "react"
import AddStudent from "./AddStudentForm/AddStudent.jsx";
import AddSupervisor from "./AddSupervisorForm/AddSupervisor.jsx";

class AdditionUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addStudentFlag: false,
            addSupervisorFlag: false,
        }
        this.addStudent = this.addStudent.bind(this);
        this.addUser = this.addUser.bind(this);
    }

    addUser() {
        this.props.addRole();
    }

    addStudent() {
        this.setState(() => {
            return {
                addStudentFlag: true,
            }
        });
    }

    addSupervisor() {
        this.setState(() => {
            return {
                addSupervisorFlag: true,
            }
        });
    }

    render() {
        if(this.state.addStudentFlag) {
            return (
                <AddStudent addRole = {this.addUser}/>
            )
        }
        if(this.state.addSupervisorFlag) {
            return (
                <AddSupervisor addRole = {this.addUser}/>
            )
        }
        return (
            <div className = "add_role_container">
                <div>
                    <div onClick={() => this.addStudent()}> Create As Student </div>
                    <div onClick={() => this.addSupervisor()}> Create As Supervisor </div>
                </div>
            </div>
        )
    }
}

export default AdditionUser