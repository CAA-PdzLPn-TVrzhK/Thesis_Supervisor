
import React from "react"
import axios from "axios";
import Group from "./GroupStudents/Group.jsx";
import "./Students.css"

class Students extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            groups: null,
        }
    }

    async componentDidMount() {
        const supervisor = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${window.TelegramWebApp.userId}`, {headers: window.TelegramWebApp.headers});
        const groups = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?supervisor_id=eq.${supervisor.data[0].id}`, {headers: window.TelegramWebApp.headers});
        this.setState({groups: groups.data});
    }

    render() {
        if(this.state.groups === null) {
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className={`students-container`}>
                <div className={`students-title`}> Group list </div>
                <div className={`students-groups`}>
                    {this.state.groups.map((group) => {
                        return (
                            <Group group={group} key={group.id}/>
                        )
                    })}
                </div>
            </div>
        )
    }
}

export default Students