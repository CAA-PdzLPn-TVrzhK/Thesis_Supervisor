
import React from "react"
import {sendNewStudent} from "./sendNewStudent.jsx";
import {getSupervisorList} from "./getSupervisorList.jsx";
import {getGroupsList} from "./getGroupsList.jsx";
import "./AddStudent.css"

class AddStudent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            studentFirstName: "",
            studentLastName: "",
            supervisorName: "",
            yearOfStudy: "",
            departmentName: "",
            programName: "",
            groupName: "",
            errorFirstname: "",
            errorLastname: "",
            errorGroup: "",
            errorSupervisor: "",
            supervisorList: [],
            groupList: [],
        }
        this.handleInputChangeFirstname = this.handleInputChangeFirstname.bind(this);
        this.handleInputChangeLastName = this.handleInputChangeLastName.bind(this);
        this.handleInputChangeSupervisorName = this.handleInputChangeSupervisorName.bind(this);
        this.handleInputChangeGroupName = this.handleInputChangeGroupName.bind(this);
        this.sendNewStudentInfo = this.sendNewStudentInfo.bind(this);
        this.back = this.back.bind(this);
        this.handleInputChangeYearOfStudy = this.handleInputChangeYearOfStudy.bind(this);
        this.handleInputChangeProgram = this.handleInputChangeProgram.bind(this);
        this.handleInputChangeDepartment = this.handleInputChangeDepartment.bind(this);
    }

    async componentDidMount() {
        const supervisorList = await getSupervisorList();
        const groupList = await getGroupsList();

        this.setState(() => {
            return {
                supervisorList: supervisorList,
                groupList: groupList,
            }
        })
    }

    handleInputChangeFirstname(event) {
        this.setState(() => {
            return {
                studentFirstName: event.target.value,
            }
        })
    }
    handleInputChangeLastName(event) {
        this.setState(() => {
            return {
                studentLastName: event.target.value,
            }
        })
    }
    handleInputChangeSupervisorName(event) {
        this.setState(() => {
            return {
                supervisorName: event.target.value,
            }
        })
    }
    handleInputChangeGroupName(event) {
        this.setState(() => {
            return {
                groupName: event.target.value,
            }
        })
    }
    handleInputChangeYearOfStudy(event) {
        this.setState(() => {
            return {
                yearOfStudy: event.target.value,
            }
        })
    }
    handleInputChangeProgram(event) {
        this.setState(() => {
            return {
                programName: event.target.value,
            }
        })
    }
    handleInputChangeDepartment(event) {
        this.setState(() => {
            return {
                departmentName: event.target.value,
            }
        })
    }

    back() {
        this.props.back();
    }

    async sendNewStudentInfo() {
        console.log('you try to submit content');
        const data = {
            firstname: this.state.studentFirstName,
            lastname: this.state.studentLastName,
            supervisor: this.state.supervisorName,
            group: this.state.groupName,
            year: this.state.yearOfStudy,
            department: this.state.departmentName,
            program: this.state.programName,
        }

        if ((data["firstname"].length === 0) || (data["lastname"].length === 0) || (data["supervisor"].length === 0) || (data["group"].length === 0)) {
            this.setState(() => {
                return {
                    errorFirstname: (data["firstname"].length === 0) ? "firstname in required" : "",
                    errorLastname: (data["lastname"].length === 0) ? "lastname in required" : "",
                    errorGroup: (data["group"].length === 0) ? "group in required" : "",
                    errorSupervisor: (data["supervisor"].length === 0) ? "supervisor in required" : "",
                };
            });
        } else {
            await sendNewStudent(data);
        }
        this.props.addRole();
    }

    render() {
        return (
            <div className = "student-card-container">
                <div className = "student-card-title">
                    Student Card
                </div>
                <div className = "student-card-form-container">
                    <form className = "student-card-form">
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title"> Write title for meeting </span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write title" onChange={this.handleInputChangeTitle}></input>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorTitle.length === 0 ? "" : `${this.state.errorTitle}`}
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title"> Write description for meeting </span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write description" onChange={this.handleInputChangeDescription}></input>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorDescription.length === 0 ? "" : `${this.state.errorDescription}`}
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title"> Choose group </span>
                            <span className = "student-card-element-field">
                                <label>
                                    <select onChange={this.handleInputChangeSupervisorName} value={this.state.supervisorName}>
                                        <option value=""></option>
                                        {this.state.supervisorList.map((supervisor) => (
                                        <option key={supervisor} value={supervisor}>
                                            {supervisor}
                                        </option>
                                        ))}
                                    </select>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorSupervisor.length === 0 ? "" : `${this.state.errorSupervisor}`}
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title">Choose your group</span>
                            <span className = "student-card-element-field">
                                <label>
                                    <select onChange={this.handleInputChangeGroupName} value={this.state.groupName}>
                                        <option value=""></option>
                                        {this.state.groupList.map((group) => (
                                        <option key={group} value={group}>
                                            {group}
                                        </option>
                                        ))}
                                    </select>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorGroup.length === 0 ? "" : `${this.state.errorGroup}`}
                            </span>

                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title">Write your year of study</span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write your year of study" onChange={this.handleInputChangeYearOfStudy}></input>
                                </label>
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title">Write your department</span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write your department" onChange={this.handleInputChangeDepartment}></input>
                                </label>
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title">Write your program</span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write your program" onChange={this.handleInputChangeProgram}></input>
                                </label>
                            </span>
                        </div>
                        <div className = "student-card-send-button-container">
                            <button type={"button"} onClick={this.back} className = "student-card-back-button-element"> back </button>
                            <button type={"button"} onClick={this.sendNewStudentInfo} className = "student-card-send-button-element"> send </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default AddStudent