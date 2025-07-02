
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

    async setDailyDeals(date) {
        const newDeals = [];
        let taskList = [];
        taskList = await getTasks();
        let meetingList = [];
        meetingList = await getMeetings();


        console.log('вернулись данные в calendar_demo:', taskList, meetingList);

        if (taskList.length > 0) {
            for(let task of taskList) {
                const taskDate = new Date(task.deadline);
                if(taskDate.getFullYear() === date.getFullYear() && taskDate.getMonth() === date.getMonth() && taskDate.getDate() === date.getDate()) {
                    let taskElement = ['task', task];
                    newDeals.push(taskElement);
                }
            }
        }
        if (meetingList.length > 0) {
            for(let meeting of meetingList) {
                const meetingDate = new Date(meeting.date);
                if(meetingDate.getFullYear() === date.getFullYear() && meetingDate.getMonth() === date.getMonth() && meetingDate.getDate() === date.getDate()) {
                    let meetingElement = ['meeting', meeting];
                    newDeals.push(meetingElement);
                }
            }
        }
        console.log('обновляем dailyDeals на:', newDeals);
        this.setState({dailyDeals: newDeals});
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
                <div className={'dateInfo'}>
                    {console.log('dailyDeals:', this.state.dailyDeals)}
                    {this.state.dailyDeals.map((dailyDeal, index) => (
                        <div key={index} className={'dateInfoElement'}>
                            {dailyDeal[0] === "task" ?
                                <div>
                                    <div>
                                        <div>{dailyDeal[0]}</div>
                                        <div>deadline: {dailyDeal[1].deadline}</div>
                                    </div>
                                    <div>
                                        <div>{dailyDeal[1].title}</div>
                                        <div>{dailyDeal[1].status === "done" ? 'Done' : 'Non done'}</div>
                                    </div>
                                </div> :
                                <div>
                                    <div>
                                        <div>{dailyDeal[0]}</div>
                                        <div>date: {dailyDeal[1].date}</div>
                                    </div>
                                    <div>
                                        <div>{dailyDeal[1].title}</div>
                                        <div>{dailyDeal[1].status === "done" ? 'Done' : 'Planned'}</div>
                                    </div>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </div>
        )
    }

}

export default Calendar;