
import React from 'react'
import axios from 'axios'
import {getTasks} from "./tasksGetter.jsx";
import {getMeetings} from "./meetingGetter.jsx";

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first_day: null,
            last_day: null,
            current_day: null,
            calendar: [],
            tasksData: [],
            tasksByDate: [],
            meetingData: [],
            meetingsByDate: [],
            dailyDeals: [],
        }

        this.getCalendar = this.getCalendar.bind(this);
    }



    componentDidMount() {
        axios.get(``)
        this.getCalendar();
    }

    getCalendar = () => {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const calendarStart = new Date(year, month, 1);
        const calendarEnd = new Date(year, month + 1, 0);
        let dateOfMonth = new Date(calendarStart);
        dateOfMonth.setDate(calendarStart.getDate() - (calendarStart.getDay() + 6) % 7);

        const calendar = [];
        for(let weekId = 0; weekId < 6; weekId++) {
            const week = [];
            for(let dayId = 0; dayId < 7; dayId++) {
                if (dateOfMonth.getMonth() !== calendarStart.getMonth()) {
                    week.push('');
                } else {
                    week.push(new Date(dateOfMonth));
                }
                dateOfMonth.setDate(dateOfMonth.getDate() + 1);
            }
            calendar.push(week);
        }
        this.setState({ calendar: calendar });
    }

    setDailyDeals = (date) => {
        let taskList = [];
        taskList = getTasks();
        let meetingList = [];
        meetingList = getMeetings();


        console.log('вернулись данные в calendar_demo:', taskList);

        if (taskList.length > 0) {
            for(let task of taskList) {
                console.log(task.date, date);
                if(task.date === date) {
                    this.setState({dailyDeals: this.state.dailyDeals.concat(['task', task])});
                }
            }
        }
        if (meetingList.length > 0) {
            for(let meeting of meetingList) {
                if(meeting.date === date) {
                    this.setState({dailyDeals: this.state.dailyDeals.concat(['meeting', meeting])});
                }
            }
        }
    }

    render() {
        return (
            <div>
                <table>
                    <thead>
                        <tr>
                            <td> <span>Mo</span> </td>
                            <td> <span>Tu</span> </td>
                            <td> <span>We</span> </td>
                            <td> <span>Th</span> </td>
                            <td> <span>Fr</span> </td>
                            <td> <span>Sa</span> </td>
                            <td> <span>Su</span> </td>
                        </tr>
                    </thead>
                    <tbody>
                    {this.state.calendar.map((week, weekIndex) => (
                        <tr key={weekIndex}>
                            {week.map((day, dayIndex) => {
                                return (
                                    <td key={`${weekIndex}-${dayIndex}`} onClick={() => this.setDailyDeals(day)}>
                                        {day === '' ? '' : day.getDate()}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div>
                    {this.state.dailyDeals.map((dailyDeal, index) => (
                        <div key={index}>
                            aa
                            {dailyDeal[0] === "meeting" ? 'meeting' : 'task'}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

}

export default Calendar;