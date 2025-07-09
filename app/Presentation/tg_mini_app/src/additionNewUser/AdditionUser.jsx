
import React from "react"
import AddStudent from "./AddStudentForm/AddStudent.jsx";
import AddSupervisor from "./AddSupervisorForm/AddSupervisor.jsx";
import "./AdditionUser.css"

class AdditionUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addStudentFlag: false,
            addSupervisorFlag: false,
        }
        this.addStudent = this.addStudent.bind(this);
        this.addUser = this.addUser.bind(this);
        this.back = this.back.bind(this);
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

    back() {
        this.setState(() => {
            return {
                addStudentFlag: false,
                addSupervisorFlag: false,
            }
        });
    }

    render() {
        if(this.state.addStudentFlag) {
            return (
                <AddStudent addRole = {this.addUser} back = {this.back}/>
            )
        }
        if(this.state.addSupervisorFlag) {
            return (
                <AddSupervisor addRole = {this.addUser} back = {this.back}/>
            )
        }
        return (
            <div className = "add-role-container">
                <div className = "add-role-field">
                    <button onClick={() => this.addStudent()} className = "add-button"> Create As Student </button>
                    <button onClick={() => this.addSupervisor()} className = "add-button"> Create As Supervisor </button>
                </div>
            </div>
        )
    }
}

export default AdditionUser