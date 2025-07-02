/* Вызывает основные компоненты
* Подвязываю header, который настраивает переменную page отвечающую за то, что возвращает main */

import React from "react"
import axios from "axios"
import Header from "./Header.jsx"
import Selector from "./Selector.jsx"
import Futter from "./Futter.jsx"
import "./BasePageComponent.css"

class StudentConstructor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: "profile",
        }
        this.setCurrentPage = this.setCurrentPage.bind(this);
    }

    setCurrentPage = (currentPage) => {
        this.setState({ currentPage: currentPage });
    }

    render() {
        console.log("you open StudentConstructor");
        return (
            <div className="container">
                <Header setCurrentPage={this.setCurrentPage} />
                <Selector currentPage={this.state.currentPage} />
                <Futter />
            </div>
        )
    }
}

export default StudentConstructor;