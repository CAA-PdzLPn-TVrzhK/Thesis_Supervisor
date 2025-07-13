
import React from "react"
import "./Profile.css"
import "../../BasePageComponent.css"
import {getUserData} from "./getUserData.jsx";
import {getRoleData} from "./getRoleData.jsx";
import {getGroupData} from "./getGroupData.jsx";
import {supabase} from "../../../ClientSupabase.jsx";

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            image: null,
            imageError: false,
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
        const { data, error } = await supabase.storage.from('supervisor-data').download(`${window.TelegramWebApp.userId}/avatar.jpg`);

        if (error) {
            console.error("Ошибка скачивания файла:", error.message);
            this.setState({ imageError: true });
        } else {
            const url = URL.createObjectURL(data);
            this.setState({ image: url });
            console.log('Ты сохранил фото и мы достали его:', url);
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
                            {this.state.imageError ? (
                                <img src="https://ds-zvyozdochka-yarcevo-r66.gosweb.gosuslugi.ru/netcat_files/21/10/Bez_foto_7.jpg" alt="No photo" className={'photo'}/>
                            ) : (
                                <img src={this.state.image} alt="Your photo" className={'photo'}/>
                            )}
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
            </div>
        )
    }
}

export default Profile;