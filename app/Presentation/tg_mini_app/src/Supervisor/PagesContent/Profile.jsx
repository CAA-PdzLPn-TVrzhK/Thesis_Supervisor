
import React from "react"
import axios from "axios";
import "./PagesContentStyle.css"

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            error: false,
            loading: true,
        }
    }

    componentDidMount() {
        this.setState({ opened: true });

        axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`,
            {
                headers: window.TelegramWebApp.headers
            }
            )
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

    render() {
        if(!this.state.data) {
            console.log(this.state.data, 'wait a bit');
            return (
                <div>
                    Please, wait a bit
                </div>
            )
        }
        return (
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
                            <span className={'info-value'}> {this.state.data[0].first_name} {this.state.data.last_name} </span>
                        </div>
                        <div className={'info-item'}>
                            <span className={'info-label'}> Email </span>
                            <span className={'info-value'}> {this.state.data[0].email} </span>
                        </div>
                        <div className={'info-item'}>
                            <span className={'info-label'}> Group </span>
                            <span className={'info-value'}> DSAI-05 </span>
                        </div>
                    </div>
                </div>

                <div className={'links-section'}>
                    <div onClick={this.goToCalendar} className={'link-card'}>Link to calendar</div>
                    <div onClick={this.goToDashboard} className={'link-card'}>Link to dashboard</div>
                    <div onClick={this.goToLeaderboard} className={'link-card'}>Link to leaderboard</div>
                </div>
            </main>
        )
    }
}

export default Profile;