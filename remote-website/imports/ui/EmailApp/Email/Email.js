import React, { Component } from 'react';
import Wrapper from '../../Wrapper/Wrapper';
import './Email.css';

export class Email extends Component {
  handleVote = () => {};

  render() {
    return (
      <Wrapper>
        <div className="email">
          <div className="from">
            <strong>From</strong>: {this.props.userGuid}
          </div>

          <div className="subject">
            <strong>Subject</strong>: {this.props.subject}
          </div>

          <div className="emailbody">{this.props.body}</div>

          <div className="buttons">
            <button type="submit" className="phishing">
              Phishy!
            </button>
            <button type="submit" className="not-phishing">
              Not Phishy!
            </button>
          </div>
        </div>
      </Wrapper>
    );
  }
}

export default Email;
