
import React from "react"
import {IconX} from "@tabler/icons-react";
import {supabase} from "../../../../../ClientSupabase.jsx";
import "./DraftInfo.css"

class DraftInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
        }
        this.close = this.close.bind(this);
    }

    async componentDidMount() {
        const { error } = await supabase.storage.from('student-data').download(`${this.props.data.user.id}/${this.props.data.milestone.id}/submission.pdf`);
        if (error) {
            console.error('Error fetching PDF URL:', error)
            this.setState({file: null});
        } else {
            const {data} = await supabase.storage.from(`student-data`).getPublicUrl(`${this.props.data.user.id}/${this.props.data.milestone.id}/submission.pdf`);
            this.setState({file: `${data.publicUrl}?v=${Date.now()}`});
        }
    }
    close() {
        this.props.close(null);
    }

    getMonthName(month_number) {
        const month_names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
        return month_names[month_number];
    }
    getDate(dateForTime) {
        const date = new Date(dateForTime);
        const day = date.getDate().toString();
        const month = this.getMonthName(date.getMonth());
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month}, ${hours}:${minutes}`;
    }

    render() {
        const data = this.props.data;
        return (
            <div className={`modal-draft-info-container`}>
                <IconX size={20} onClick={this.close} className={`draft-info-container-close-button`}/>
                <div className={`draft-info-container-main-block`}>
                    <div className={`draft-info-container-main-block-title`}>
                        Draft Info
                    </div>
                    <div className={`draft-info-container-main-block-body`}>
                        <div className={`draft-info-container-main-block-body-element`}>
                            <div className={`draft-info-container-main-block-body-element-label`}> comment: </div>
                            <div className={`draft-info-container-main-block-body-element-value`}> {data.submission.comments} </div>
                        </div>
                        <div className={`draft-info-container-main-block-body-element`}>
                            <div className={`draft-info-container-main-block-body-element-label`}> submission time: </div>
                            <div className={`draft-info-container-main-block-body-element-value`}> {this.getDate(data.submission.submitted_at)} </div>
                        </div>
                        <div className={`draft-info-container-main-block-body-element`}>
                            <div className={`draft-info-container-main-block-body-element-label`}> file: </div>
                            <div className={`draft-info-container-main-block-body-element-value`}>
                                {this.state.file === null ?
                                    <div> We cannot get your work. </div> :
                                    <a href={this.state.file} target="_blank" rel="noreferrer"> draft </a>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default DraftInfo