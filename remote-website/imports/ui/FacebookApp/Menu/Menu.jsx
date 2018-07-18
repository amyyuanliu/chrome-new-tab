/*
 * File: Menu.jsx
 * Project: Chrome New Tab
 * File Created: Monday, 9th July 2018 8:25:03 am
 * Description:
 * Authors: Rosie Sun (rosieswj@gmail.com)
 *          Gustavo Umbelino (gumbelin@gmail.com)
 * -----
 * Last Modified: Wed Jul 18 2018
 * -----
 * Copyright (c) 2018 - 2018 CHIMPS Lab, HCII CMU
 */

import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import './Menu.scss';

export class Menu extends Component {
  static propTypes = {
    filter: PropTypes.func.isRequired,
    selectedCategory: PropTypes.string,
    categories: PropTypes.instanceOf(Array).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  };

  static defaultProps = {
    selectedCategory: null
  };

  handleShuffle = () => {};

  handleViewAll = () => {
    window.open(`${this.props.history.location.pathname}/summary`, '_blank');
  };

  render() {
    return (
      <div className="sidebar">
        <div className="filter">
          <span id="filter-title">
            Filter:{' '}
            {this.props.selectedCategory ? this.props.selectedCategory : ''}
          </span>
          {this.props.categories.map(category => (
            <button
              key={category}
              className="category"
              onClick={() => this.props.filter(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div id="view-all">
          <button onClick={() => this.handleViewAll()}>
            View all questions
          </button>
        </div>
        {/* <div id="view-all">
          <button onClick={() => Meteor.logout()}>Logout from Facebook</button>
        </div> */}
      </div>
    );
  }
}

export default Menu;
