
import React from 'react'
import {getMeetings} from "./meetingGetter.jsx";
import './calendar.css'
import NewMeeting from "./NewMeeting/NewMeeting.jsx";
import MeetingInfo from "./MeetingInfo/MeetingInfo.jsx";
import ReactDOM from "react-dom";

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
            newMeeting: false,
            meetingData: null,
            detailedMeetingInfo: false,
            groupDataForMeeting: null,
        }

        this.getCalendar = this.getCalendar.bind(this);
        this.back = this.back.bind(this);
        this.backMeetingInfo = this.backMeetingInfo.bind(this);
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
        let meetingList = [];
        meetingList = await getMeetings();

        let days= [];
        if (meetingList.length > 0) {
            for(let meeting of meetingList) {
                const meetingDate = new Date(meeting[0].date);
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
        let meetingList = [];
        meetingList = await getMeetings();
        this.setState({current_day: date.getDate()});

        if (meetingList.length > 0) {
            for(let meeting of meetingList) {
                const meetingDate = new Date(meeting[0].date);
                if(meetingDate.getFullYear() === date.getFullYear() && meetingDate.getMonth() === date.getMonth() && meetingDate.getDate() === date.getDate()) {
                    let meetingElement = ['meeting', meeting[0], meeting[1]];
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

    createNewMeeting() {
        this.setState({newMeeting: true});
    }

    back() {
        this.setState({newMeeting: false});
        this.getCalendar();
    }

    getDetailedInfo(data, group) {
        this.setState({
            meetingData: data,
            groupDataForMeeting: group,
            detailedMeetingInfo: true,
        })
    }

    backMeetingInfo() {
        this.setState({
            detailedMeetingInfo: false,
        })
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
                            <div className='date-info-block' onClick={() => this.getDetailedInfo(dailyDeal[1], dailyDeal[2])}>
                                <div className='date-info-main-data-block'>
                                    <div className='date-info-main-data-element'>{dailyDeal[0]}</div>
                                    <div className='date-info-main-data-element'>date: {this.getTimeForInfoBlock(dailyDeal[1].date)}</div>
                                </div>
                                <div className='date-info-main-data-block'>
                                    <div className='date-info-main-data-element'> Group: {dailyDeal[2]} </div>
                                </div>
                                <div className='date-info-optional-data-block'>
                                    <div className='date-info-optional-data-element'>{dailyDeal[1].title}</div>
                                </div>
                                <div className='date-info-status-data-element'>{dailyDeal[1].status === "done" ? 'Done' : (dailyDeal[1].status === "not started" ? 'Not started' : 'In process')}</div>
                            </div>
                        </div>
                    ))}
                    <div className = "new-meeting-button-container">
                        <button className = "new-meeting-button" onClick = {() => {this.createNewMeeting()}}> Create meeting </button>
                    </div>
                </div>
                {this.state.detailedMeetingInfo && ReactDOM.createPortal(
                    <MeetingInfo
                        data={this.state.meetingData}
                        group={this.state.groupDataForMeeting}
                        back={this.backMeetingInfo}
                    />,
                    document.getElementById("modal-root")
                )}
                {this.state.newMeeting && ReactDOM.createPortal(
                    <NewMeeting
                        back={this.back}
                        year={this.state.year}
                        month={this.state.month}
                        day={this.state.current_day}
                        monthToString={this.getMonthName(this.state.month)}
                    />,
                    document.getElementById("modal-root")
                )}
            </div>
        )
    }

}

export default Calendar;