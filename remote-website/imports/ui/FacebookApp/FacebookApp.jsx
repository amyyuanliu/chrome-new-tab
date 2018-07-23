/*
 * File: FacebookApp.jsx
 * Project: Chrome New Tab
 * File Created: Friday, July 6 2018, 10:59 am
 * Description: Main component for FacebookApp
 * Path: /facebookapp
 * Authors: Rosie Sun (rosieswj@gmail.com)
 *          Gustavo Umbelino (gumbelin@gmail.com)
 * -----
 * Last Modified: Mon Jul 23 2018
 * -----
 * Copyright (c) 2018 - 2018 CHIMPS Lab, HCII CMU
 */

import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { graphql, compose } from 'react-apollo';
import { Line } from 'rc-progress';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Question from './Question/Question';
import '../assets/font.css';
import './FacebookApp.scss';
import Wrapper from '../Components/Wrapper/Wrapper';
import Users from '../../api/users/users';
import Menu from './Menu/Menu';
import Thanks from './Thanks/Thanks';

export class FacebookApp extends Component {
  static propTypes = {
    history: PropTypes.shape({
      go: PropTypes.func.isRequired,
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        guid: PropTypes.string
      }).isRequired
    }).isRequired,
    refetch: PropTypes.func.isRequired,
    user: PropTypes.shape({
      responses: PropTypes.array.isRequired
    }),
    loading: PropTypes.bool.isRequired,
    aswerQuestion: PropTypes.func.isRequired,
    questions: PropTypes.instanceOf(Array),
    userExists: PropTypes.bool.isRequired
  };

  static defaultProps = {
    user: null,
    questions: []
  };

  constructor(props) {
    super(props);
    this.state = { categoryFilter: null };
  }

  componentDidMount() {
    Meteor.call('hasCookies', this.props.match.params.guid, results => {
      console.log(results);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.user === null) return true;
    if (
      this.props.loading !== nextProps.loading ||
      this.props.userExists !== nextProps.userExists
    ) {
      return true;
    }
    if (this.state.categoryFilter !== nextState.categoryFilter) return true;
    if (this.props.user.responses.length === nextProps.user.responses.length) {
      return false;
    }
    return true;
  }

  getRandomQuestion = max => Math.floor(Math.random() * max);

  handleViewAll = () => {
    window.open(`${this.props.history.location.pathname}/summary`, '_blank');
  };

  logoutAndClear = () => {
    // log user out
    Meteor.call('clearCookies', this.userGuid, () => {
      window.open('https://www.facebook.com', '_blank');
    });
  };

  // called when user advances to the next question
  submitVote = (question, option, currentSetting) => {
    this.props
      .aswerQuestion({
        variables: {
          guid: this.userGuid,
          questionId: question._id,
          optionId: option._id,
          currentSetting
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  filterByCategory = category => {
    console.log(category);
    this.setState({ categoryFilter: category });
  };

  renderQuestion = q => {
    if (q) {
      return (
        <Question
          submitVote={this.submitVote}
          key={q._id}
          question={q}
          userGuid={this.userGuid}
          answered={false}
        />
      );
    }

    return <div>Thanks for participating!</div>;
  };

  render() {
    if (this.props.loading || !this.props.userExists) {
      return '';
    }

    // ids of questions answered
    const answeredIds = this.props.user.responses.map(res => res.questionId);

    // functions to filter questions
    const contains = _id => answeredIds.indexOf(_id) > -1;
    const catFilter = (q, cat) => (cat ? q.category === cat : true);

    // get unique categories from questions
    const categories = this.props.questions
      .map(q => q.category)
      // .filter(category => category !== this.state.categoryFilter)
      .filter(function(item, i, ar) {
        return ar.indexOf(item) === i;
      });

    // get questions that belong to selected category
    const filteredQuestions = this.props.questions.filter(q =>
      catFilter(q, this.state.categoryFilter)
    );

    const percent =
      (this.props.user.responses.length / this.props.questions.length) * 100;

    const barcolor = () => {
      if (percent < 33) {
        return '#95c1e5';
      } else if (percent > 66) {
        return '#0f74d8';
      }
      return '#589ff4';
    };
    // get questions that have NOT been answered
    const unansweredQuestions = filteredQuestions.filter(q => !contains(q._id));

    // get userGuid from URL
    this.userGuid = this.props.match.params.guid;
    if (this.userGuid === undefined) {
      return 'Please use the Chrome Extension!';
    }

    // there are questions to answer, display a random one
    const numQuestions = unansweredQuestions.length;

    if (numQuestions === 0 && this.state.categoryFilter) {
      // TODO: App shouldn't end...
      console.log('No more questions on this category!');
      this.setState({
        categoryFilter: null
      });
      return '';
    }

    const questionToRender =
      unansweredQuestions[this.getRandomQuestion(numQuestions)];

    // TODO: used for test only
    // const questionToRender = unansweredQuestions[0];

    return (
      <Wrapper>
        {questionToRender ? (
          <div className="grid-wrapper">
            <div className="grid-sidebar">
              <Menu
                selectedCategory={this.state.categoryFilter}
                filter={this.filterByCategory}
                categories={categories}
                history={this.props.history}
                logout={this.logoutAndClear}
              />
            </div>
            <div className="grid-content">
              <Line
                percent={percent}
                strokeWidth="2"
                strokeColor={barcolor()}
              />
              {this.renderQuestion(questionToRender)}
            </div>
          </div>
        ) : (
          // TODO: change this to be more useful!
          <Thanks />
        )}
      </Wrapper>
    );
  }
}

// mutation used to submit vote to database
const aswerQuestion = gql`
  mutation answerQuestion(
    $guid: String!
    $questionId: ID!
    $optionId: ID!
    $currentSetting: String
  ) {
    aswerQuestion(
      guid: $guid
      questionId: $questionId
      optionId: $optionId
      currentSetting: $currentSetting
    ) {
      responses {
        question {
          title
          _id
        }
        option {
          title
          _id
          count
        }
      }
    }
  }
`;

// query used to fetch questions from database
const questionsQuery = gql`
  query Questions {
    questions {
      _id
      title
      category
      description
      url
      scrapeTag
      totalVotes
      topOption {
        title
        count
      }
      options {
        _id
        title
        count
      }
    }
  }
`;

// pre-populate props using graphql and withTracker
export default compose(
  graphql(questionsQuery, {
    props: ({ data }) => ({ ...data })
  }),
  graphql(aswerQuestion, {
    name: 'aswerQuestion'
  }),
  withTracker(props => {
    const usersHandle = Meteor.subscribe('users');
    const loading = !usersHandle.ready();
    const user = Users.findOne({ guid: props.match.params.guid });
    const userExists = !loading && !!user;
    return {
      user,
      userExists
    };
  })
)(FacebookApp);
