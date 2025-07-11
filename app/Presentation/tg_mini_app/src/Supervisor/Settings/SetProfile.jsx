
import axios from "axios"
import React from "react"
import ReactDOM from "react-dom";

class SetProfile extends React.Component {
    constructor() {
        super();
        this.state = {
            firstname: "",
            firstnameError: "",
            lastname: "",
            lastnameError: "",

        }
        this.close = this.close.bind(this);
    }

    close() {
        this.props.close();
    }

    render() {
        return (
            <div>
                <div>
                    <span> Write new name if you want: </span>
                    <span>
                        <label>
                            <input type="text" placeholder="new name"></input>
                        </label>
                    </span>
                    <span></span>
                </div>
                <button onClick={this.close}> close </button>
            </div>
        )
    }
}

export default SetProfile