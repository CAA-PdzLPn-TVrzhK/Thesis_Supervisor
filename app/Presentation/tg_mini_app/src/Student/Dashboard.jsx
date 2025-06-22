import axios from 'axios';
import Profile from "./Profile.jsx"
import Calendar from "./Calendar.jsx"
import Leaderboard from "./Leaderboard.jsx"
import React from "react";
import './style.css'

const API_BASE = window.TelegramWebApp?.API_BASE || "https://52.87.161.100:8000/";

class Dashboard extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            profile: false,
            calendar: false,
            dashboard: true,
            leaderboard: false,
            data: [],
            error: false,
            loading: true,
        }

        axios.get(`${API_BASE}users/telegram/${this.props.id}`).then(res => {
            this.setState({data: res.data});
        }).catch(() => {
            this.setState({error: true});
        }).finally(() => {
            this.setState({loading: false});
        })

        this.goToCalendar = this.goToCalendar.bind(this);
        this.goToProfile = this.goToProfile.bind(this);
        this.goToDashboard = this.goToDashboard.bind(this);
        this.goToLeaderboard = this.goToLeaderboard.bind(this);
    }

    goToProfile() {
        this.setState({profile: true});
        this.setState({dashboard: false});
        this.setState({calendar: false});
        this.setState({leaderboard: false});
    }
    goToCalendar() {
        this.setState({profile: false});
        this.setState({dashboard: false});
        this.setState({calendar: true});
        this.setState({leaderboard: false});
    }
    goToDashboard() {
        this.setState({profile: false});
        this.setState({dashboard: true});
        this.setState({calendar: false});
        this.setState({leaderboard: false});
    }
    goToLeaderboard() {
        this.setState({profile: false});
        this.setState({dashboard: false});
        this.setState({calendar: false});
        this.setState({leaderboard: true});
    }

    render() {
        if(this.state.loading) {
            return (
                <div className={'loading'}>
                    <img src={"https://i.pinimg.com/originals/0c/8a/b9/0c8ab93774c8668240569070288cf9ce.gif"} alt="Загрузка" className={"loading_image"}></img>
                </div>
            )
        }

        if (this.state.profile) {
            return <Profile id={this.props.id}/>
        }
        if (this.state.calendar) {
            return <Calendar id={this.props.id}/>
        }
        // if (this.state.dashboard) {
        //     return <Dashboard id={this.props.id}/>
        // }
        if (this.state.leaderboard) {
            return <Leaderboard id={this.props.id}/>
        }

        return (
            <div className={'profile-container'}>
                <header className={'header'}>
                    <div className={'nav-bar'}>
                        <span onClick={this.goToProfile} className={'nav-item'}> Profile </span>
                        <span onClick={this.goToCalendar} className={'nav-item'}> Calendar </span>
                        <span onClick={this.goToDashboard} className={'nav-item'}> Dashboard </span>
                        <span onClick={this.goToLeaderboard} className={'nav-item'}> Leaderboard </span>
                    </div>
                </header>
                <main>
                    Dashboard
                </main>
                <futter className={'footer'}>
                    <div className={'footer-content'}>
                        <div>
                            <span>email: </span>
                            <span>innopolis.university@@@@@@@@mail.ru</span>
                        </div>
                        <div>
                            <span>phone: </span>
                            <span>89276256545</span>
                        </div>
                    </div>
                </futter>
            </div>
        )
    }
}

export default Dashboard