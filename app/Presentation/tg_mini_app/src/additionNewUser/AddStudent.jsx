
import React from "react"
import {sendNewStudent} from "./sendNewStudent.jsx";

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
        }
        this.handleInputChangeFirstname = this.handleInputChangeFirstname.bind(this);
        this.handleInputChangeLastName = this.handleInputChangeLastName.bind(this);
        this.handleInputChangeSupervisorName = this.handleInputChangeSupervisorName.bind(this);
        this.handleInputChangeGroupName = this.handleInputChangeGroupName.bind(this);
        this.sendNewStudentInfo = this.sendNewStudentInfo.bind(this);
        this.handleInputChangeYearOfStudy = this.handleInputChangeYearOfStudy.bind(this);
        this.handleInputChangeProgram = this.handleInputChangeProgram.bind(this);
        this.handleInputChangeDepartment = this.handleInputChangeDepartment.bind(this);
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

        if (data["firstname"].length === 0) {
            this.setState(() => {
                return {
                    errorFirstname: "firstname in required",
                };
            });
        } else if(data["lastname"].length === 0) {
            this.setState(() => {
                return {
                    errorLastname: "lastname in required",
                };
            });
        } else {
            await sendNewStudent(data);
        }
        this.props.addRole();
    }

    render() {
        return (
            <div>
                <div>
                    Student Card
                </div>
                <div>
                    <form>
                        <div>
                            <span>Write your firstname</span>
                            <span>
                                <label>
                                    <input type="text" placeholder="Write your name" onChange={this.handleInputChangeFirstname}></input>
                                </label>
                            </span>
                            <span>
                                {this.state.errorFirstname.length === 0 ? "" : `${this.state.errorFirstname}`}
                            </span>
                        </div>
                        <div>
                            <span>Write your lastname</span>
                            <span>
                                <label>
                                    <input type="text" placeholder="Write your lastname" onChange={this.handleInputChangeLastName}></input>
                                </label>
                            </span>
                            <span>
                                {this.state.errorLastname.length === 0 ? "" : `${this.state.errorLastname}`}
                            </span>
                        </div>
                        <div>
                            <span>Write your supervisor(fullname)</span>
                            <span>
                                <label>
                                    <input type="text" placeholder="Write your lastname" onChange={this.handleInputChangeSupervisorName}></input>
                                </label>
                            </span>
                        </div>
                        <div>
                            <span>Write your group</span>
                            <span>
                                <label>
                                    <input type="text" placeholder="Write your group" onChange={this.handleInputChangeGroupName}></input>
                                </label>
                            </span>
                        </div>
                        <div>
                            <span>Write your year of study</span>
                            <span>
                                <label>
                                    <input type="text" placeholder="Write your year of study" onChange={this.handleInputChangeYearOfStudy}></input>
                                </label>
                            </span>
                        </div>
                        <div>
                            <span>Write your department</span>
                            <span>
                                <label>
                                    <input type="text" placeholder="Write your department" onChange={this.handleInputChangeDepartment}></input>
                                </label>
                            </span>
                        </div>
                        <div>
                            <span>Write your program</span>
                            <span>
                                <label>
                                    <input type="text" placeholder="Write your program" onChange={this.handleInputChangeProgram}></input>
                                </label>
                            </span>
                        </div>
                        <div>
                            <button type={"button"} onClick={this.sendNewStudentInfo}> send info </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default AddStudent