
import React from "react"
import "../PagesContentStyle.css"
import {getUserData} from "./getUserData.jsx";
import {getSupervisorData} from "./getSupervisorData.jsx";
import {getRoleData} from "./getRoleData.jsx";

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userData: null,
            roleData: null,
            supervisorData: null,
            error: false,
            loading: true,
        }
    }

    async componentDidMount() {
        try {
            console.log("в данный момент id студента:", window.TelegramWebApp.userId);

            const gotUserData = await getUserData();
            console.log("gotUserData:", gotUserData);

            const gotRoleData = await getRoleData();
            console.log("gotRoleData:", gotRoleData);

            const gotSupervisorData = await getSupervisorData(gotRoleData[0].supervisor_id);
            console.log("gotSupervisorData:", gotSupervisorData);

            this.setState({
                userData: gotUserData,
                roleData: gotRoleData,
                supervisorData: gotSupervisorData,
                loading: false,
            });
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            this.setState({ error: true, loading: false });
        }
    }

    render() {
        if(!this.state.userData || !this.state.roleData || !this.state.supervisorData) {
            console.log(this.state.userData, this.state.roleData, this.state.supervisorData, 'wait a bit');
            return (
                <div>
                    Please, wait a bit
                </div>
            )
        }
        console.log('user data for profile:', this.state.userData);
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
                            <span className={'info-value'}> {this.state.userData[0].first_name} {this.state.userData[0].last_name} </span>
                        </div>
                        <div className={'info-item'}>
                            <span className={'info-label'}> Email </span>
                            <span className={'info-value'}> {this.state.userData[0].email} </span>
                        </div>
                        <div className={'info-item'}>
                            <span className={'info-label'}> Group </span>
                            <span className={'info-value'}> {this.state.roleData[0].group} </span>
                        </div>
                        <div className={'info-item'}>
                            <span className={'info-label'}> Supervisor </span>
                            <span className={'info-value'}> Nikita Selezenev </span>
                        </div>
                        <div className={'info-item'}>
                            <span className={'info-label'}> Score </span>
                            <span className={'info-value'}> {this.state.roleData[0].score} </span>
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