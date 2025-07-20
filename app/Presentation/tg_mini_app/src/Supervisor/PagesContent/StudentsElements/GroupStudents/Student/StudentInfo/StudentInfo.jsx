
import React from "react"
import axios from "axios";
import "./StudentInfo.css"

class StudentInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.data.user,
            student: this.props.data.student,
            group: null,
        }
    }

    async componentDidMount() {
        const group = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?id=eq.${this.props.data.student.peer_group_id}`, {headers: window.TelegramWebApp.headers});
        this.setState({group: group.data[0]});
    }

    render() {
        if(this.state.group === null) {
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className={`navigation-bar-student-info-container`}>
                <div className={`navigation-bar-student-info-container-element`}>
                    <div className={`navigation-bar-student-info-container-element-label`}> Name: </div>
                    <div className={`navigation-bar-student-info-container-element-value`}> {this.state.user.first_name} {this.state.user.last_name} </div>
                </div>
                <div className={`navigation-bar-student-info-container-element`}>
                    <div className={`navigation-bar-student-info-container-element-label`}> Group: </div>
                    <div className={`navigation-bar-student-info-container-element-value`}> {this.state.group.name} </div>
                </div>
                <div className={`navigation-bar-student-info-container-element`}>
                    <div className={`navigation-bar-student-info-container-element-label`}> Score: </div>
                    <div className={`navigation-bar-student-info-container-element-value`}> {this.state.student.score} </div>
                </div>
                <div className={`navigation-bar-student-info-container-element`}>
                    <div className={`navigation-bar-student-info-container-element-label`}> Progress: </div>
                    <div className={`navigation-bar-student-info-container-element-value`}> {this.state.student.progress}% </div>
                </div>
                <div className={`navigation-bar-student-info-container-element`}>
                    <div className={`navigation-bar-student-info-container-element-label`}> Year: </div>
                    <div className={`navigation-bar-student-info-container-element-value`}> {this.state.student.year} </div>
                </div>
                <div className={`navigation-bar-student-info-container-element`}>
                    <div className={`navigation-bar-student-info-container-element-label`}> Department: </div>
                    <div className={`navigation-bar-student-info-container-element-value`}> {this.state.student.department} </div>
                </div>
                <div className={`navigation-bar-student-info-container-element`}>
                    <div className={`navigation-bar-student-info-container-element-label`}> Program: </div>
                    <div className={`navigation-bar-student-info-container-element-value`}> {this.state.student.program} </div>
                </div>
            </div>
        )
    }
}

export default StudentInfo