
import React from "react"
import {getGroupList} from "./getGroupList.jsx";
import axios from "axios"
import "./NewMeeting.css"

class NewMeeting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            groupList: [],
            errorTitle: "",
            errorDescription: "",
            errorDuration: "",
            errorGroup: "",
            errorDate: "",
            title: "",
            description: "",
            duration: "",
            group: "",
            date: "",
        }
        this.handleInputChangeTitle = this.handleInputChangeTitle.bind(this);
        this.handleInputChangeDescription = this.handleInputChangeDescription.bind(this);
        this.handleInputChangeGroup = this.handleInputChangeGroup.bind(this);
        this.handleInputChangeDuration = this.handleInputChangeDuration.bind(this);
        this.handleInputChangeDate = this.handleInputChangeDate.bind(this);
        this.back = this.back.bind(this);
    }

    async componentDidMount() {
        const groupListData = await getGroupList();
        console.log("groupListData в создании нового митинга:", groupListData);
        this.setState(() => {
            return {
                groupList: groupListData,
            }
        });
    }

    handleInputChangeTitle(event) {
        this.setState(() => {
            return {
                title: event.target.value,
            }
        })
    }
    handleInputChangeDescription(event) {
        this.setState(() => {
            return {
                description: event.target.value,
            }
        })
    }
    handleInputChangeGroup(event) {
        this.setState(() => {
            return {
                group: event.target.value,
            }
        })
    }
    handleInputChangeDuration(event) {
        this.setState(() => {
            return {
                duration: event.target.value,
            }
        })
    }
    handleInputChangeDate(event) {
        this.setState(() => {
            return {
                date: event.target.value,
            }
        })
    }

    validationValues() {
        console.log('Валидация');
        if(this.state.title.trim() === "" || this.state.description.trim() === "" || this.state.group.trim() === "" || this.state.duration.trim() === "" || this.state.date.trim() === "") {
            this.setState((p) => {
                return {
                    errorTitle: p.title.trim() === "" ? "Title is required" : "",
                    errorDescription: p.description.trim() === "" ? "Description is required" : "",
                    errorGroup: p.group.trim() === "" ? "Group is required" : "",
                    errorDuration: p.duration.trim() === "" ? "Duration is required" : "",
                    errorDate: p.date.trim() === "" ? "Date is required" : "",
                }
            });
            console.log('Ты не прошел валидацию');
            return false;
        }
        return true;
    }

    async createMeeting() {
        console.log('Ты запустил метод для создания новой функции');
        if (this.validationValues()) {
            console.log('Ты прошел валидацию');
            const supervisorData = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${window.TelegramWebApp.userId}`, {headers: window.TelegramWebApp.headers});
            const groupData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?name=eq.${this.state.group}`, {headers: window.TelegramWebApp.headers});
            console.log('Ты получил необходимые данные для создания новой функции');

            const year = this.props.year;
            const month = String(this.props.month+1).padStart(2, '0');
            const day = String(this.props.day).padStart(2, '0');
            const time = this.state.date + ":00";

            const data = {
                supervisor_id: supervisorData.data[0].id,
                title: this.state.title,
                description: this.state.description,
                date: new Date(`${year}-${month}-${day}T${time}`).toISOString(),
                peer_group_id: groupData.data[0].id,
                duration_minutes: this.state.duration
            };
            console.log('Ты подготовил данные для создания');
            await axios.post(`${window.TelegramWebApp.API_BASE}meetings`, data, {
                headers: window.TelegramWebApp.headers
            });
            console.log('Ты создал');
            this.props.back();
        }
    }

    back() {
        this.props.back();
    }

    render() {
        return (
            <div className="new-meeting-container">
                <div className="new-meeting-title"> New meeting Card</div>
                <div className="new-meeting-title"> on {this.props.day} {this.props.monthToString} {this.props.year} </div>
                <div className = "new-meeting-form-container">
                    <span className = "new-meeting-form-element-title">Write title for meeting</span>
                    <span className = "new-meeting-form-element-field">
                        <label>
                            <input type="text" placeholder="Write title" onChange={this.handleInputChangeTitle}></input>
                        </label>
                    </span>
                    <span className = "new-meeting-form-element-error">
                        {this.state.errorTitle.length === 0 ? "" : `${this.state.errorTitle}`}
                    </span>
                </div>
                <div className = "new-meeting-form-container">
                    <span className = "new-meeting-form-element-title">Write description for meeting</span>
                    <span className = "new-meeting-form-element-field">
                        <label>
                            <input type="text" placeholder="Write description" onChange={this.handleInputChangeDescription}></input>
                        </label>
                    </span>
                    <span className = "new-meeting-form-element-error">
                        {this.state.errorDescription.length === 0 ? "" : `${this.state.errorDescription}`}
                    </span>
                </div>
                <div className = "new-meeting-form-container">
                    <span className = "new-meeting-form-element-title">Choose group for meeting</span>
                    <span className = "new-meeting-form-element-field">
                        <label>
                            <select onChange={this.handleInputChangeGroup} value={this.state.group}>
                                <option value=""></option>
                                {this.state.groupList.map((group) => (<option key={group} value={group}>
                                        {group}
                                </option>
                                ))}
                            </select>
                        </label>
                    </span>
                    <span className = "new-meeting-form-element-error">
                        {this.state.errorGroup.length === 0 ? "" : `${this.state.errorGroup}`}
                    </span>
                </div>
                <div className = "new-meeting-form-container">
                    <span className = "new-meeting-form-element-title">Write duration of meeting in minutes</span>
                    <span className = "new-meeting-form-element-field">
                        <label>
                            <input type="text" placeholder="Write duration in minutes" onChange={this.handleInputChangeDuration}></input>
                        </label>
                    </span>
                    <span className = "new-meeting-form-element-error">
                        {this.state.errorDuration.length === 0 ? "" : `${this.state.errorDuration}`}
                    </span>
                </div>
                <div className = "new-meeting-form-container">
                    <span className = "new-meeting-form-element-title">Write date for meeting</span>
                    <span className = "new-meeting-form-element-field">
                        <label>
                            <input type="text" placeholder="Write date in format hh:mm" onChange={this.handleInputChangeDate}></input>
                        </label>
                    </span>
                    <span className = "new-meeting-form-element-error">
                        {this.state.errorDate.length === 0 ? "" : `${this.state.errorDate}`}
                    </span>
                </div>
                <div className = "new-meeting-form-buttons">
                    <button onClick={() => this.back()} className = "new-meeting-form-button-back"> back </button>
                    <button onClick={() => this.createMeeting()} className = "new-meeting-form-button-create"> create </button>
                </div>
            </div>
        )
    }
}

export default NewMeeting