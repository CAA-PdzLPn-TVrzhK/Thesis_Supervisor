
import React from "react"
import {IconX} from "@tabler/icons-react";
import axios from "axios"
import "./StudentInfo.css"

class StudentInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            group: null,
            count: null,
            successful: null,
        }
        this.close = this.close.bind(this);
    }

    async componentDidMount() {
        const group = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?id=eq.${this.props.data.student.peer_group_id}`, { headers: window.TelegramWebApp.headers });
        const submissions = await axios.get(`${window.TelegramWebApp.API_BASE}submissions?student_id=eq.${this.props.data.student.id}`, { headers: window.TelegramWebApp.headers });
        let count = 0;
        let successful = 0;
        if(submissions.data.length > 0) {
            successful = submissions.data.length;
            for(let sub of submissions.data) {
                count = count + parseInt(sub.count);
            }
        }
        this.setState({group: group.data[0], count: count, successful: successful});
    }

    close() {
        this.props.close(null);
    }

    render() {
        const data = this.props.data;
        if(this.state.group === null && this.state.successful === null && this.state.count === null) {
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className={`modal-student-info-container`}>
                <IconX size={20} onClick={this.close} className={`student-info-container-close-button`}/>
                <div className={`student-info-container-main-block`}>
                    <div className={`student-info-container-main-block-title`}>
                        Student Info
                    </div>
                    <div className={`student-info-container-main-block-body`}>
                        <div className={`student-info-container-main-block-body-element`}>
                            <div className={`student-info-container-main-block-body-element-label`}> full name: </div>
                            <div className={`student-info-container-main-block-body-element-value`}> {data.user.first_name} {data.user.last_name} </div>
                        </div>
                        <div className={`student-info-container-main-block-body-element`}>
                            <div className={`student-info-container-main-block-body-element-label`}> group: </div>
                            <div className={`student-info-container-main-block-body-element-value`}> {this.state.group.name} </div>
                        </div>
                        <div className={`student-info-container-main-block-body-element`}>
                            <div className={`student-info-container-main-block-body-element-label`}> email: </div>
                            <div className={`student-info-container-main-block-body-element-value`}> {data.user.email} </div>
                        </div>
                        <div className={`student-info-container-main-block-body-element`}>
                            <div className={`student-info-container-main-block-body-element-label`}> all submissions: </div>
                            <div className={`student-info-container-main-block-body-element-value`}> {this.state.count} </div>
                        </div>
                        <div className={`student-info-container-main-block-body-element`}>
                            <div className={`student-info-container-main-block-body-element-label`}> all successful submissions: </div>
                            <div className={`student-info-container-main-block-body-element-value`}> {this.state.successful} </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default StudentInfo