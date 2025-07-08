
import React from "react"
import "./Profile.css"
import "../../BasePageComponent.css"
import {getUserData} from "./getUserData.jsx";
import {getRoleData} from "./getRoleData.jsx";
import {getGroupData} from "./getGroupData.jsx";

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userData: null,
            roleData: null,
            groupData: null,
            error: false,
            loading: true,
        }
    }

    async componentDidMount() {
        try {
            const gotUserData = await getUserData();
            console.log("gotUserData:", gotUserData);

            const gotRoleData = await getRoleData(gotUserData[0].id);
            console.log("gotRoleData:", gotRoleData);

            const gotGroupData = await getGroupData(gotRoleData[0].id);
            console.log("gotGroupData:", gotGroupData)

            this.setState({
                userData: gotUserData,
                roleData: gotRoleData,
                groupData: gotGroupData,
                loading: false,
            });
        } catch (error) {
            console.error( "user_id:", window.TelegramWebApp.userId, "role_id:", window.TelegramWebApp.roleId, "больше информации", error.response.data, "Ошибка загрузки данных:", error);
            this.setState({ error: true, loading: false });
        }
    }

    goToPage(page) {
        this.props.setCurrentPage(page);
    }

    render() {
        if(!this.state.userData || !this.state.roleData || !this.state.groupData) {
            console.log(this.state.userData, this.state.roleData, this.state.supervisorData, this.state.groupData, this.state.supervisorUserData, 'wait a bit');
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className={'main'}>
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
                            <span className={'info-label'}> Groups </span>
                            <span className={'info-value'}> {this.state.groupData.map((group, i) => ((this.state.groupData.length - 1 === i) ? `${group} ` : `${group}, `))} </span>
                        </div>
                        <div className={'info-item'}>
                            <span className={'info-label'}> Department </span>
                            <span className={'info-value'}> {this.state.roleData[0].department} </span>
                        </div>
                    </div>
                </div>

                <div className={'links-section'}>
                    <div onClick={() => this.goToPage("calendar")} className={'link-card'}>Link to calendar</div>
                </div>
                <div className={'links-section'}>
                    <div onClick={() => this.goToPage("dashboard")} className={'link-card'}>Link to dashboard</div>
                </div>
            </div>
        )
    }
}

export default Profile;