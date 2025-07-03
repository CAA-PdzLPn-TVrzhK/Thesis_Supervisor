
import StudentConstructor from "../Student/Constructor.jsx"
import SupervisorConstructor from "../Supervisor/Constructor.jsx"
import React from "react";
import {getUserId} from "./getUserId.jsx";
import {getDataOfUser} from "./getDataOfUser.jsx";

class Distributor extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            error: false,
            loading: true,
        }
    }

    async componentDidMount() {
        window.TelegramWebApp.userId  = await getUserId();
        console.log('userId:', window.TelegramWebApp.userId);
        const userData = await getDataOfUser();
        console.log('userData:', userData);
        this.setState({data: userData});

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
        console.log("you open Distributor and get data:");
        console.log(this.state.data[0].role, this.state.data, this.state.error);
        if (this.state.data[0].role === "student") {
            return (
                <div>
                    <StudentConstructor/>
                </div>
            )
        } else if (this.state.data[0].role === "supervisor") {
            return (
                <div>
                    <SupervisorConstructor/>
                </div>
            )
        } else {
            return (
                <div className="distributor_error_role">
                    <div> We cannot identify your role. Please contact supporter: </div>
                    <div>
                        <span>number: </span>
                        <span>8-800-555-35-35</span> 
                    </div>
                    <div>
                        <span>email: </span>
                        <span>innopolis.university@gmail.com</span>
                    </div>
                    <img src={"https://i.pinimg.com/originals/39/1b/92/391b92e4592898ff613a205baf8572ef.jpg"} alt="Котенок)))" className={'photo_distributor_error_role'}/>
                </div>
            )
        }
    }
}

export default Distributor;