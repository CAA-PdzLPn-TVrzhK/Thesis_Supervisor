import axios from 'axios';
import Students from "./Students"
import Calendar from "./Calendar"
import React from "react";
import './style.css'

const API_BASE = "http://52.87.161.100:8000/"

class StudentProfile extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            profile: true,
            calendar: false,
            students: false,
            data: [],
            error: false,
            loading: true,
        }

        this.goToCalendar = this.goToCalendar.bind(this);
        this.goToProfile = this.goToProfile.bind(this);
        this.goToStudents = this.goToStudents.bind(this);
    }

    componentDidMount() {
        this.setState({ data: this.props.sata });

        // axios.get(`${API_BASE}users/telegram/${this.props.id}`)
        //     .then(res => {
        //         this.setState({ data: res.data });
        //     })
        //     .catch(() => {
        //         this.setState({ error: true });
        //     })
        //     .finally(() => {
        //         this.setState({ loading: false });
        //     });
    }

    goToProfile() {
        this.setState({profile: true});
        this.setState({students: false});
        this.setState({calendar: false});
    }
    goToCalendar() {
        this.setState({profile: false});
        this.setState({students: false});
        this.setState({calendar: true});
    }
    goToStudents() {
        this.setState({profile: false});
        this.setState({students: true});
        this.setState({calendar: false});
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
        if (this.state.students) {
            return <Students id={this.props.id}/>
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
                        <span onClick={this.goToStudents} className={'nav-item'}> Dashboard </span>
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
                        </div>
                    </div>

                    <div className={'links-section'}>
                        <div onClick={this.goToCalendar} className={'link-card'}>Link to calendar</div>
                        <div onClick={this.goToStudents} className={'link-card'}>Link to students list</div>
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