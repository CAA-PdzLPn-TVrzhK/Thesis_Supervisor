import axios from 'axios';
import Dashboard from "./Dashboard.jsx"
import Calendar from "./Calendar.jsx"
import Leaderboard from "./Leaderboard.jsx"
import React from "react";
import './style.css'

class StudentProfile extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            profile: true,
            calendar: false,
            dashboard: false,
            leaderboard: false,
            data: [],
            error: false,
            loading: true,
        }

        this.goToCalendar = this.goToCalendar.bind(this);
        this.goToProfile = this.goToProfile.bind(this);
        this.goToDashboard = this.goToDashboard.bind(this);
        this.goToLeaderboard = this.goToLeaderboard.bind(this);
    }

    componentDidMount() {
        this.setState({ opened: true });

        axios.get(`${window.TelegramWebApp.API_BASE}users/telegram/${window.TelegramWebApp.userId}`)
            .then(res => {
                this.setState({ data: res.data });
            })
            .catch(() => {
                this.setState({ error: true });
            })
            .finally(() => {
                this.setState({ loading: false });
            });
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

        // if (this.state.profile) {
        //     return <Profile id={this.props.id}/>
        // }
        if (this.state.calendar) {
            return <Calendar id={this.props.id}/>
        }
        if (this.state.dashboard) {
            return <Dashboard id={this.props.id}/>
        }
        if (this.state.leaderboard) {
            return <Leaderboard id={this.props.id}/>
        }

        if(this.state.error) {
            return (
                <div>error</div>
            )
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
                <main className={'main'}>
                    <div className={'profile-card'}>
                        <div className={'profile-photo'}>
                            <div className={'photo-placeholder'}>
                                <img src="https://avatars.mds.yandex.net/i?id=22ce1f281996c9d5fe2e2100ed418afb_l-5869591-images-thumbs&n=13" alt="Описание изображения" className={'photo'}/>
                            </div>
                        </div>
                        <div className={'profile-info'}>
                            <div className={'info-item'}>
                                <span className={'info-label'}> Name </span>
                                <span className={'info-value'}> {this.state.data.first_name} {this.state.data.last_name} </span>
                            </div>
                            <div className={'info-item'}>
                                <span className={'info-label'}> Email </span>
                                <span className={'info-value'}> {this.state.data.email} </span>
                            </div>
                            <div className={'info-item'}>
                                <span className={'info-label'}> Group </span>
                                <span className={'info-value'}> DSAI-05 AA </span>
                            </div>
                            <div className={'info-item'}>
                                <span className={'info-label'}> Supervisor </span>
                                <span className={'info-value'}> Nikita BB </span>
                            </div>
                            <div className={'info-item'}>
                                <span className={'info-label'}> Score </span>
                                <span className={'info-value'}> 6941 AA </span>
                        </div>
                        </div>
                    </div>

                    <div className={'links-section'}>
                        <div onClick={this.goToCalendar} className={'link-card'}>Link to calendar</div>
                        <div onClick={this.goToDashboard} className={'link-card'}>Link to dashboard</div>
                        <div onClick={this.goToLeaderboard} className={'link-card'}>Link to leaderboard</div>
                    </div>
                </main>
                <futter  className={'footer'}>
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

export default StudentProfile