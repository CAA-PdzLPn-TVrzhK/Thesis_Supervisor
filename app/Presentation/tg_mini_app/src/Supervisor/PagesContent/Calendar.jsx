
import axios from 'axios';
import React from "react";

class Calendar extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: [],
            error: false,
            loading: true,
            tasks: {
                "MONDAY": ["none"],
                "TUESDAY": ["none"],
                "WEDNESDAY": ["upload work's part"],
                "THURSDAY": ["none"],
                "FRIDAY": ["upload your"],
                "SATURDAY": ["none"],
                "SUNDAY": ["none"]
            },
            meetings: {
                "MONDAY": ["none"],
                "TUESDAY": ["none"],
                "WEDNESDAY": ["none"],
                "THURSDAY": ["none"],
                "FRIDAY": ["none"],
                "SATURDAY": ["none"],
                "SUNDAY": ["Meeting in 108 at 14.30"]
            },
        }

        axios.get(`${window.TelegramWebApp.API_BASE}users/telegram/${window.TelegramWebApp.userId}`).then(res => {
            this.setState({data: res.data});
        }).catch(() => {
            this.setState({error: true});
        }).finally(() => {
            this.setState({loading: false});
        })
    }

    render() {
        if(this.state.loading) {
            return (
                <div className={'loading'}>
                    <img src={"https://i.pinimg.com/originals/0c/8a/b9/0c8ab93774c8668240569070288cf9ce.gif"} alt="Загрузка" className={"loading_image"}></img>
                </div>
            )
        }

        return (
            <div className={'profile-container'}>
                <main>
                    Calendar
                </main>
            </div>
        )
    }
}

export default Calendar