
import React from 'react'
import axios from 'axios'
import {getTasks} from "./tasksGetter.jsx";
import {getMeetings} from "./meetingGetter.jsx";

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        const now = new Date();
        this.state = {
            first_day: null,
            last_day: null,
            current_day: null,
            calendar: [],
            year: now.getFullYear(),
            month: now.getMonth(),
            dailyDeals: [],
        }

        this.getCalendar = this.getCalendar.bind(this);
    }



    componentDidMount() {
        this.getCalendar();
    }

    getMonthName(month_number) {
        if (month_number === 12) { month_number = 0; }
        if (month_number === -1) { month_number = 11; }

        const month_names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
        return month_names[month_number];
    }

    goToNextMonth = () => {
        this.setState((previous_data) => {
            if (previous_data.month === 11) {
                return {
                    month: 0,
                    year: previous_data.year + 1,
                }
            } else {
                return {
                    month: previous_data.month + 1,
                }
            }
        }, this.getCalendar);
    }

    goToPreviousMonth = () => {
        this.setState((previous_data) => {
            if (previous_data.month === 0) {
                return {
                    month: 11,
                    year: previous_data.year - 1,
                }
            } else {
                return {
                    month: previous_data.month - 1,
                }
            }
        }, this.getCalendar);
    }

    getCalendar = () => {
        const year = this.state.year;
        const month = this.state.month;
        console.log('Current month:', month, 'Current year:', year);
        const calendarStart = new Date(year, month, 1);
        let dateOfMonth = new Date(calendarStart);
        dateOfMonth.setDate(calendarStart.getDate() - (calendarStart.getDay() + 6) % 7);

        const calendar = [];
        for(let weekId = 0; weekId < 6; weekId++) {
            const week = [];
            for(let dayId = 0; dayId < 7; dayId++) {
                if (dateOfMonth.getMonth() !== month) {
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
                <div>
                    <span onClick={this.goToPreviousMonth}> {this.getMonthName(this.state.month - 1)} </span>
                    <span> {this.getMonthName(this.state.month)} </span>
                    <span onClick={this.goToNextMonth}> {this.getMonthName(this.state.month + 1)}</span>
                </div>
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