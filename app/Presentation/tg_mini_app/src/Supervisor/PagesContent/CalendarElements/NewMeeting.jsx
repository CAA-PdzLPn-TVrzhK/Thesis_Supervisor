
import React from "react"

class NewMeeting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
        this.back = this.back.bind(this);
    }

    back() {
        this.props.back();
    }

    render() {
        return (
            <div className="">
                <div> New Task Card</div>
                <div className = "student-card-element-container">
                            <span className = "student-card-element-title">Write your firstname</span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write your name" onChange={this.handleInputChangeFirstname}></input>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorFirstname.length === 0 ? "" : `${this.state.errorFirstname}`}
                            </span>
                        </div>
                        <div className = "student-card-element-container">
                            <span className = "student-card-element-title">Write your lastname</span>
                            <span className = "student-card-element-field">
                                <label>
                                    <input type="text" placeholder="Write your lastname" onChange={this.handleInputChangeLastName}></input>
                                </label>
                            </span>
                            <span className = "student-card-element-error">
                                {this.state.errorLastname.length === 0 ? "" : `${this.state.errorLastname}`}
                            </span>
                        </div>
                    <div className = "student-card-element-container">
                        <span className = "student-card-element-title">Choose your supervisor</span>
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
                <div>
                    <button onClick={() => this.back()}> back </button>
                    <button> create </button>
                </div>
            </div>
        )
    }
}

export default NewMeeting