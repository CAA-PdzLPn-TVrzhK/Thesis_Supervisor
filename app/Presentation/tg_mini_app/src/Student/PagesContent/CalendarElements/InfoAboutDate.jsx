
import axios from "axios";
import React from "react"

class InfoDate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
        }
    }

    //axios.get(`${window.TelegramWebApp.API_BASE}/users/${window.TelegramWebApp.userId}/calendarInfo/${date}`)

    activateDateInfo = (date) => {
        axios.get(`${window.TelegramWebApp.API_BASE}/users/${window.TelegramWebApp.userId}/calendarInfo/${date}`)
        .then(res => {
            this.setState({data: res.data});
        })
    }

    render() {
        return (
            <div className="info-date">
                <ul className="info-date-list">

                </ul>
            </div>
        )
    }
}

export default InfoDate;