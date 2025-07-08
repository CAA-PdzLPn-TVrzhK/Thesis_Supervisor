
import React from "react"
import {sendNewSupervisor} from "./sendNewSupervisor.jsx";
import "./AddSupervisor.css"
import {getGroupsList} from "./getGroupsList.jsx";
import Select from "react-select";

class AddSupervisor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            supervisorFirstname: "",
            supervisorLastname: "",
            departmentName: "",
            groupNames: [],
            errorFirstname: "",
            errorLastname: "",
            errorGroups: "",
            groupList: [],
        }
        this.sendNewSupervisorInfo = this.sendNewSupervisorInfo.bind(this);
        this.handleInputChangeFirstname = this.handleInputChangeFirstname.bind(this);
        this.handleInputChangeLastName = this.handleInputChangeLastName.bind(this);
        this.handleInputChangeGroupName = this.handleInputChangeGroupName.bind(this);
        this.handleInputChangeDepartment = this.handleInputChangeDepartment.bind(this);
    }

    async componentDidMount() {
        const groupList = await getGroupsList();
        const options = groupList.map((group) => ({
            value: group,
            label: group,
        }));

        this.setState(() => {
            return {
                groupList: options,
            }
        })
    }

    handleInputChangeFirstname(event) {
        this.setState(() => {
            return {
                supervisorFirstname: event.target.value,
            }
        })
    }
    handleInputChangeLastName(event) {
        this.setState(() => {
            return {
                supervisorLastname: event.target.value,
            }
        })
    }
    handleInputChangeGroupName(selectedOptions) {
        this.setState(() => {
            return {
                groupNames: selectedOptions || [],
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

    async sendNewSupervisorInfo() {
        console.log('you try to submit content');
        const data = {
            firstname: this.state.supervisorFirstname,
            lastname: this.state.supervisorLastname,
            groups: (this.state.groupNames).map((group) => group.value),
            department: this.state.departmentName,
        }

        if ((data["firstname"].length === 0) || (data["lastname"].length === 0) || (data["groups"].length === 0)) {
            this.setState(() => {
                return {
                    errorFirstname: (data["firstname"].length === 0) ? "firstname in required" : "",
                    errorLastname: (data["lastname"].length === 0) ? "lastname in required" : "",
                    errorGroups: (data["groups"].length === 0) ? "at least one group is required" : "",
                };
            });
        } else {
            await sendNewSupervisor(data);
        }
        this.props.addRole();
    }

    render() {
        return (
            <div className = "supervisor-card-container">
                <div className = "student-card-title">
                    Supervisor Card
                </div>
                <div className = "supervisor-card-form-container">
                    <form className = "supervisor-card-form">
                        <div className = "supervisor-card-element-container">
                            <span className = "supervisor-card-element-title">Write your firstname</span>
                            <span className = "supervisor-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write your name" onChange={this.handleInputChangeFirstname}></input>
                                </label>
                            </span>
                            <span className = "supervisor-card-element-error">
                                {this.state.errorFirstname}
                            </span>
                        </div>
                        <div className = "supervisor-card-element-container">
                            <span className = "supervisor-card-element-title">Write your lastname</span>
                            <span className = "supervisor-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write your lastname" onChange={this.handleInputChangeLastName}></input>
                                </label>
                            </span>
                            <span className = "supervisor-card-element-error">
                                {this.state.errorLastname}
                            </span>
                        </div>
                        <div className = "supervisor-card-element-container">
                            <span className = "supervisor-card-element-title">Select your groups</span>
                            <span className="supervisor-card-element-field">
                                <Select
                                    options={this.state.groupList}
                                    isMulti
                                    value={this.state.groupNames}
                                    onChange={this.handleInputChangeGroupName}
                                    placeholder="Select groups..."
                                    className="supervisor-select-container"
                                    classNamePrefix="supervisor-select"
                                />
                            </span>
                            <span className = "supervisor-card-element-error">
                                {this.state.errorGroups}
                            </span>
                        </div>
                        <div className = "supervisor-card-element-container">
                            <span className = "supervisor-card-element-title">Write your department</span>
                            <span className = "supervisor-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write your department" onChange={this.handleInputChangeDepartment}></input>
                                </label>
                            </span>
                        </div>
                        <div className = "supervisor-card-send-button-container">
                            <button type={"button"} onClick={this.sendNewSupervisorInfo} className = "student-card-send-button-element"> send </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default AddSupervisor