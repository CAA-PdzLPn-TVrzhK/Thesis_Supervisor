
import React from 'react'
import {getTasks} from "./tasksGetter.jsx";
import {getMeetings} from "./meetingGetter.jsx";
import './calendar.css'

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        const now = new Date();
        this.state = {
            current_all_date: now,
            current_day: now.getDate(),
            calendar: [],
            year: now.getFullYear(),
            month: now.getMonth(),
            dailyDeals: [],
            dateWithInfo: [],
        }

        this.getCalendar = this.getCalendar.bind(this);
    }



    componentDidMount() {
        this.getCalendar();
        this.setDailyDeals(this.state.current_all_date);
    }

    getMonthName(month_number) {
        if (month_number === 12) { month_number = 0; }
        if (month_number === -1) { month_number = 11; }

        const month_names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
        return month_names[month_number];
    }

    goToNextYear = () => {
        this.setState((previous_data) => {
            return {
                year: previous_data.year + 1,
            }
        }, this.getCalendar);
    }

    goToPreviousYear = () => {
        this.setState((previous_data) => {
            return {
                year: previous_data.year - 1,
            }
        }, this.getCalendar);
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

    async getDaysWithTask() {
        let taskList = [];
        taskList = await getTasks();
        let meetingList = [];
        meetingList = await getMeetings();

        let days= [];
        if (taskList.length > 0) {
            for(let task of taskList) {
                const taskDate = new Date(task.deadline);
                if(taskDate.getFullYear() === this.state.year && taskDate.getMonth() === this.state.month) {
                    days.push(taskDate.getDate());
                }
            }
        }
        if (meetingList.length > 0) {
            for(let meeting of meetingList) {
                const meetingDate = new Date(meeting.date);
                if(meetingDate.getFullYear() === this.state.year && meetingDate.getMonth() === this.state.month) {
                    days.push(meetingDate.getDate());
                }
            }
        }

        console.log('date with task:', days);
        this.setState(() => {
            return {
                dateWithInfo: days,
            }
        });
    }

    getCalendar = () => {
        this.getDaysWithTask();
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

    getTimeForInfoBlock(dateForTime) {
        const date = new Date(dateForTime);
        const day = date.getDate().toString();
        const month = this.getMonthName(date.getMonth());
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month}, ${hours}:${minutes}`;
    }

    render() {
        if (this.state.calendar.length === 0) {
            return (
                <div>
                    <img src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className='calendar-container'>
                <div className='years-calendar-block'>
                    <span onClick={this.goToPreviousYear} className='years-calendar-element'> {this.state.year - 1} </span>
                    <span className='years-calendar-element-current'> {this.state.year} </span>
                    <span onClick={this.goToNextYear} className='years-calendar-element'> {this.state.year + 1} </span>
                </div>
                <div className='years-month-block'>
                    <span onClick={this.goToPreviousMonth} className='years-month-element'> {this.getMonthName(this.state.month - 1)} </span>
                    <span className='years-month-element-current'> {this.getMonthName(this.state.month)} </span>
                    <span onClick={this.goToNextMonth} className='years-month-element'> {this.getMonthName(this.state.month + 1)}</span>
                </div>
                <table className='calendar-main-container'>
                    <thead className='calendar-days-of-week-block'>
                        <tr>
                            <td> <span className='calendar-days-of-week-element'>Mo</span> </td>
                            <td> <span className='calendar-days-of-week-element'>Tu</span> </td>
                            <td> <span className='calendar-days-of-week-element'>We</span> </td>
                            <td> <span className='calendar-days-of-week-element'>Th</span> </td>
                            <td> <span className='calendar-days-of-week-element'>Fr</span> </td>
                            <td> <span className='calendar-days-of-week-element'>Sa</span> </td>
                            <td> <span className='calendar-days-of-week-element'>Su</span> </td>
                        </tr>
                    </thead>
                    <tbody  className='calendar-main-date-block'>
                    {this.state.calendar.map((week, weekIndex) => (
                        <tr key={weekIndex} className='calendar-main-date-element-week-block'>
                            {week.map((day, dayIndex) => {
                                return (
                                    <td key={`${weekIndex}-${dayIndex}`}
                                        onClick={() => this.setDailyDeals(day)}
                                        className= {(day !== '') ?
                                            (
                                                this.state.dateWithInfo.includes(day.getDate()) ?
                                                    (
                                                        (day.getDate() === this.state.current_all_date.getDate() && day.getMonth() === this.state.current_all_date.getMonth() && day.getFullYear() === this.state.current_all_date.getFullYear()) ?
                                                            'calendar-main-date-element-active-with-task' :
                                                            'calendar-main-date-element-with-task'
                                                    ) :
                                                    (
                                                        (day.getDate() === this.state.current_all_date.getDate() && day.getMonth() === this.state.current_all_date.getMonth() && day.getFullYear() === this.state.current_all_date.getFullYear()) ?
                                                            'calendar-main-date-element-active' :
                                                            'calendar-main-date-element'
                                                    )
                                            ) :
                                            ''}>
                                        {day === '' ? '' : day.getDate()}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className='date-info-container'>
                    <div className = "current-date-for-info-container"> {this.getMonthName(this.state.month)} {this.state.current_day} </div>
                    {this.state.dailyDeals.map((dailyDeal, index) => (
                        <div key={index}>
                            {dailyDeal[0] === "task" ?
                                <div className='date-info-block'>
                                    <div className='date-info-main-data-block'>
                                        <div className='date-info-main-data-element'>{dailyDeal[0]}</div>
                                        <div className='date-info-main-data-element'>deadline: {this.getTimeForInfoBlock(dailyDeal[1].deadline)}</div>
                                    </div>
                                    <div className='date-info-optional-data-block'>
                                        <div className='date-info-optional-data-element'>{dailyDeal[1].title}</div>
                                    </div>
                                    <div className='date-info-status-data-element'>{dailyDeal[1].status === "done" ? 'Done' : 'Non done'}</div>
                                </div> :
                                <div className='date-info-block'>
                                    <div className='date-info-main-data-block'>
                                        <div className='date-info-main-data-element'>{dailyDeal[0]}</div>
                                        <div className='date-info-main-data-element'>date: {this.getTimeForInfoBlock(dailyDeal[1].date)}</div>
                                    </div>
                                    <div className='date-info-optional-data-block'>
                                        <div className='date-info-optional-data-element'>{dailyDeal[1].title}</div>
                                    </div>
                                    <div className='date-info-status-data-element'>{dailyDeal[1].status === "done" ? 'Done' : 'Planned'}</div>
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