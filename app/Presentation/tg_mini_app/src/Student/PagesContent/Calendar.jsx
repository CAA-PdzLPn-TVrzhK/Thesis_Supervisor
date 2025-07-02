
import axios from 'axios';
import React from "react";

class Calendar extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: [],
            error: false,
            loading: true,
            currentDate: null,
            currentDay: null,
            //currentDate: null,
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
                "SUNDAY": ["none"]
            },
            currentWeek: this.getCurrentWeek(),
        }

        axios.get(`${window.TelegramWebApp.API_BASE}users/telegram/${window.TelegramWebApp.userId}`).then(res => {
            this.setState({data: res.data});
        }).catch(() => {
            this.setState({error: true});
        }).finally(() => {
            this.setState({loading: false});
        })
    }

    getCurrentWeek() {
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const today = new Date();
        const startDate = today.getDay();
        //const dayOfWeek = today.getDay();
        //const currentDay = today.getDate();
        //const currentMonth = today.getMonth();
        startDate.setDate(today.getDate());

        const week = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            week.push({
                name: days[i],
                date: date.getDate(),
                month: date.toLocaleString('default', { month: 'short' })
            });
        }
        return week;
    }

    render() {
        if(this.state.loading) {
            return (
                <div className={'loading'}>
                    <img src={"https://i.pinimg.com/originals/0c/8a/b9/0c8ab93774c8668240569070288cf9ce.gif"} alt="Загрузка" className={"loading_image"}></img>
                </div>
            )
        }

        const daysOfWeek = this.state.currentWeek;

        return (
            <div className="calendar-view">
                <table className="calendar-table">
                    <tbody>
                    {daysOfWeek.map((day) => (
                        <React.Fragment key={day.name}>
                            <tr>
                                <td className="day-header" rowSpan="2">
                                    <div className="day-name">{day.name}</div>
                                    <div className="day-date">{day.month} {day.date}</div>
                                </td>
                                <td className="task-cell">{this.state.tasks[day.name][0]}</td>
                                <td className="task-cell">{this.state.tasks[day.name][1]}</td>
                            </tr>
                            <tr>
                                <td className="meeting-cell">{this.state.meetings[day.name][0]}</td>
                                <td className="meeting-cell">{this.state.meetings[day.name][1]}</td>
                            </tr>
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Calendar