/* Вызывает основные компоненты
* Подвязываю header, который настраивает переменную page отвечающую за то, что возвращает main */

import React from "react"
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
                <Header />
                <Selector currentPage={this.state.currentPage} setCurrentPage={this.setCurrentPage}/>
                <Futter setCurrentPage={this.setCurrentPage} />
            </div>
        )
    }
}

export default StudentConstructor;