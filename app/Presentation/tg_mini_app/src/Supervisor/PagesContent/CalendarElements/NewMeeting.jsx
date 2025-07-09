
import React from "react"

class NewMeeting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
        this.back = this.back.bind(this);
    }

    back() {
        this.props.back();
    }

    render() {
        return (
            <div className="">
                <div> New Task Card</div>
                <div>

                </div>
                <div>
                    <button onClick={() => this.back()}> back </button>
                    <button> create </button>
                </div>
            </div>
        )
    }
}

export default NewMeeting