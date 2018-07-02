import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import './Email.css';

export class Email extends Component {
  state = {
    voted: false,
  };

  handleVote = (phishy, _id) => {
    if (this.state.voted) {
      return;
    }

    // clicked phishy
    if (phishy) {
      this.props
        .votePhishy({
          variables: {
            _id,
          },
        })
        .then(({ data }) => {
          this.phishyButton.innerHTML = data.votePhishy.isPhishing;
          this.notPhishyButton.innerHTML = data.votePhishy.notPhishing;
          this.setState({
            voted: true,
          });
        })
        .catch(error => {
          console.error(error);
        });

      // clicked not phishy
    } else {
      this.props
        .voteNotPhishy({
          variables: {
            _id,
          },
        })
        .then(({ data }) => {
          this.phishyButton.innerHTML = data.voteNotPhishy.isPhishing;
          this.notPhishyButton.innerHTML = data.voteNotPhishy.notPhishing;
          this.setState({
            voted: true,
          });
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  render() {
    return (
      <div className="email">
        <div className="from">
          <strong>From</strong>: {this.props.userGuid}
        </div>

        <div className="subject">
          <strong>Subject</strong>: {this.props.subject}
        </div>

        <div className="emailbody">{this.props.body}</div>

        <div className="buttons">
          <button
            ref={input => {
              this.phishyButton = input;
            }}
            onClick={() => this.handleVote(true, this.props._id)}
            type="submit"
            className="phishing"
          >
            Phishy!
          </button>

          <button
            ref={input => {
              this.notPhishyButton = input;
            }}
            onClick={() => this.handleVote(false, this.props._id)}
            type="submit"
            className="not-phishing"
          >
            Not Phishy!
          </button>
        </div>
      </div>
    );
  }
}

const votePhishy = gql`
  mutation votePhishy($_id: ID!) {
    votePhishy(_id: $_id) {
      _id
      isPhishing
      notPhishing
    }
  }
`;

const voteNotPhishy = gql`
  mutation voteNotPhishy($_id: ID!) {
    voteNotPhishy(_id: $_id) {
      _id
      isPhishing
      notPhishing
    }
  }
`;

export default compose(
  graphql(votePhishy, {
    name: 'votePhishy',
  }),
  graphql(voteNotPhishy, {
    name: 'voteNotPhishy',
  }),
)(Email);
