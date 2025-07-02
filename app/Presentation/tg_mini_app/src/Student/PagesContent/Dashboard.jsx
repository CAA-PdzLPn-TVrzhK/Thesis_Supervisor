import axios from 'axios';
import React from "react";
import "./PagesContentStyle.css"

class Dashboard extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: [],
            error: false,
            loading: true,
        }

        axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`).then(res => {
            this.setState({data: res.data});
        }).catch(() => {
            this.setState({error: true});
        }).finally(() => {
            this.setState({loading: false});
        })
    }

    render() {
        if(this.state.loading) {
            return (
                <div className={'loading'}>
                    <img src={"https://i.pinimg.com/originals/0c/8a/b9/0c8ab93774c8668240569070288cf9ce.gif"} alt="Загрузка" className={"loading_image"}></img>
                </div>
            )
        }

        return (

            <div className={'profile-container'}>
                <main>
                    <div className="dashboard-info">

                        <div className="thesis-info">
                            <div className={"dashboard-block-first"}>
                                <div className={"thesis-name-header"}>Your thesis</div>
                                <div>name</div>
                            </div>
                            <div className={"dashboard-block"}>
                                <div className={"thesis-name-header"}>Current step</div>
                                <div>description</div>
                            </div>
                        </div>
                        <div>
                            <form>
                                <div>
                                    <input placeholder={"Write your thesis."} className={"input-box"}>

                                    </input>
                                </div>
                                <div className={"buttons-complect"}>
                                    <button className={"button-form"}>
                                        upload
                                    </button>
                                    <button className={"button-form"}>
                                        send
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className={"scroll-box"}>
                            <div className={"scroll-box-header"}>
                                All steps
                            </div>
                            <ul className="scroll-box-content">
                                <li className="scroll-item" /*onClick={this.goToStepInformation(1)}*/>
                                    <div className="item-text">
                                        <div className="item-title">Заголовок элемента 1</div>
                                        <div className="item-description">Описание элемента с дополнительной
                                            информацией
                                        </div>
                                    </div>
                                    <div className="item-badge">Passed</div>
                                </li>
                                <li className="scroll-item" /*onClick={this.goToStepInformation(1)}*/>
                                    <div className="item-text">
                                        <div className="item-title">Заголовок элемента 1</div>
                                        <div className="item-description">Описание элемента с дополнительной
                                            информацией
                                        </div>
                                    </div>
                                    <div className="item-badge">Passed</div>
                                </li>
                                <li className="scroll-item" /*onClick={this.goToStepInformation(1)}*/>
                                    <div className="item-text">
                                        <div className="item-title">Заголовок элемента 1</div>
                                        <div className="item-description">Описание элемента с дополнительной
                                            информацией
                                        </div>
                                    </div>
                                    <div className="item-badge">Current</div>
                                </li>
                                <li className="scroll-item" /*onClick={this.goToStepInformation(1)}*/>
                                    <div className="item-text">
                                        <div className="item-title">Заголовок элемента 1</div>
                                        <div className="item-description">Описание элемента с дополнительной
                                            информацией
                                        </div>
                                    </div>
                                    <div className="item-badge">Non-passed</div>
                                </li>
                                <li className="scroll-item" /*onClick={this.goToStepInformation(1)}*/>
                                    <div className="item-text">
                                        <div className="item-title">Заголовок элемента 1</div>
                                        <div className="item-description">Описание элемента с дополнительной
                                            информацией
                                        </div>
                                    </div>
                                    <div className="item-badge">Non-passed</div>
                                </li>
                                <li className="scroll-item" /*onClick={this.goToStepInformation(1)}*/>
                                    <div className="item-text">
                                        <div className="item-title">Заголовок элемента 1</div>
                                        <div className="item-description">Описание элемента с дополнительной
                                            информацией
                                        </div>
                                    </div>
                                    <div className="item-badge">Non-passed</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        )
    }
}

export default Dashboard