
import React from "react"
import {sendNewStudent} from "./sendNewStudent.jsx";
import {getSupervisorList} from "./getSupervisorList.jsx";
import {getGroupsList} from "./getGroupsList.jsx";
import "./AddStudent.css"
import axios from "axios";

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
            supervisors: [],
            groups: [],
            thesisTitle: "",
            thesisDescription: "",
            errorThesisTitle: "",
            errorThesisDescription: "",
        }
        this.handleInputChangeFirstname = this.handleInputChangeFirstname.bind(this);
        this.handleInputChangeLastName = this.handleInputChangeLastName.bind(this);
        this.handleInputChangeSupervisorName = this.handleInputChangeSupervisorName.bind(this);
        this.handleInputChangeGroupName = this.handleInputChangeGroupName.bind(this);
        this.sendNewStudentInfo = this.sendNewStudentInfo.bind(this);
        this.back = this.back.bind(this);
        this.handleInputChangeThesisTitle = this.handleInputChangeThesisTitle.bind(this);
        this.handleInputChangeThesisDescription = this.handleInputChangeThesisDescription.bind(this);
        this.handleInputChangeYearOfStudy = this.handleInputChangeYearOfStudy.bind(this);
        this.handleInputChangeProgram = this.handleInputChangeProgram.bind(this);
        this.handleInputChangeDepartment = this.handleInputChangeDepartment.bind(this);
    }

    async componentDidMount() {
        const supervisorNameList = await getSupervisorList();
        const groupNameList = await getGroupsList();

        const groupDataList = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );
        const supervisorDataList = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );

        this.setState(() => {
            return {
                supervisorList: supervisorNameList,
                groupList: groupNameList,
                groups: groupDataList.data,
                supervisors: supervisorDataList.data,
            }
        })
    }

    handleInputChangeThesisTitle(event) {
        this.setState(() => {
            return {
                thesisTitle: event.target.value,
            }
        })
    }
    handleInputChangeThesisDescription(event) {
        this.setState(() => {
            return {
                thesisDescription: event.target.value,
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
    async handleInputChangeSupervisorName(event) {
        const supervisorName = event.target.value;
        const supervisorParams = supervisorName.split(" ");
        let newGroupList = [];

        if(supervisorName === "") {
            for (let group of this.state.groups) {
                newGroupList.push(group.name);
            }
        } else {
            const user = await axios.get(`${window.TelegramWebApp.API_BASE}users`,
                {
                    params: {
                        'first_name': `eq.${supervisorParams[0]}`,
                        'last_name': `eq.${supervisorParams[1]}`,
                    },
                    headers: window.TelegramWebApp.headers,
                });

            let currentSupervisor = null;
            for (let supervisor of this.state.supervisors) {
                if(supervisor.user_id === user.data[0].id) {
                    currentSupervisor = supervisor.id;
                }
            }

            for (let group of this.state.groups) {
                if(group.supervisor_id === currentSupervisor) {
                    newGroupList.push(group.name);
                }
            }
        }

        this.setState(() => {
            return {
                supervisorName: supervisorName,
                groupList: newGroupList,
            }
        }, () => {
            console.log('новый супервизор из состояния', this.state.supervisorName, 'новый лист групп из состояния', this.state.groupList);
        })
    }
    async handleInputChangeGroupName(event) {
        const groupName = event.target.value;
        let newSupervisorList = [];
        let newSupervisorListId = [];

        if(groupName === "") {
            for(let supervisor of this.state.supervisors) {
                const user = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${supervisor.user_id}`, {headers: window.TelegramWebApp.headers});
                newSupervisorList.push(`${user.data[0].first_name} ${user.data[0].last_name}`)
            }
        } else {
            for(let group of this.state.groups) {
                if(group.name === groupName) {
                    newSupervisorListId.push(group.supervisor_id)
                }
            }

            for(let supervisor of this.state.supervisors) {
                if(supervisor.id === newSupervisorListId[0]) {
                    const user = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${supervisor.user_id}`, {headers: window.TelegramWebApp.headers});
                    newSupervisorList.push(`${user.data[0].first_name} ${user.data[0].last_name}`)
                }
            }
        }

        this.setState(() => {
            return {
                groupName: groupName,
                supervisorList: newSupervisorList,
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
            thesisTitle: this.state.thesisTitle,
            thesisDescription: this.state.thesisDescription,
        }

        if ((data["firstname"].length === 0) || (data["lastname"].length === 0) || (data["supervisor"].length === 0) || (data["group"].length === 0) || (data["thesisTitle"].length === 0) || (data["thesisDescription"].length === 0)) {
            this.setState(() => {
                return {
                    errorFirstname: (data["firstname"].length === 0) ? "firstname in required" : "",
                    errorLastname: (data["lastname"].length === 0) ? "lastname in required" : "",
                    errorGroup: (data["group"].length === 0) ? "group in required" : "",
                    errorSupervisor: (data["supervisor"].length === 0) ? "supervisor in required" : "",
                    errorThesisTitle: (data["thesisTitle"].length === 0) ? "thesis title in required" : "",
                    errorThesisDescription: (data["thesisDescription"].length === 0) ? "thesis description in required" : "",
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
                            <span className = "student-card-element-title"> Write your firstname </span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write firstname" onChange={this.handleInputChangeFirstname}></input>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorFirstname.length === 0 ? "" : `${this.state.errorFirstname}`}
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title"> Write your lastname </span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write lastname" onChange={this.handleInputChangeLastName}></input>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorLastname.length === 0 ? "" : `${this.state.errorLastname}`}
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title"> Choose your supervisor </span>
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
                            <span className = "student-card-element-title"> Write your thesis title </span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write thesis title" onChange={this.handleInputChangeThesisTitle}></input>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorThesisTitle.length === 0 ? "" : `${this.state.errorThesisTitle}`}
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title"> Write your thesis description </span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write thesis description" onChange={this.handleInputChangeThesisDescription}></input>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorThesisDescription.length === 0 ? "" : `${this.state.errorThesisDescription}`}
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