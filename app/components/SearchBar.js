import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link, History } from 'react-router'
import reactMixin from 'react-mixin'

import { SearchActions } from '../store/search'
import { NavigationActions } from '../store/navigation'

function mapStateToProps(state) {
  return {
    location: state.navigation.location
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SearchActions, dispatch)
}

@reactMixin.decorate(History)
class SearchBar extends Component {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    timeout: PropTypes.number.isRequired,
    searchIdentities: PropTypes.func.isRequired,
    location: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      query: '',
      searchResults: [],
      timeoutId: null,
      placeholder: this.props.placeholder
    }

    this.onQueryChange = this.onQueryChange.bind(this)
    this.submitQuery = this.submitQuery.bind(this)
    this.onFocus = this.onFocus.bind(this)
    this.onBlur = this.onBlur.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({
        query: nextProps.location
      })
    }
  }

  submitQuery(query) {
    const newPath = `search/${query.replace(' ', '%20')}`
    this.history.pushState(null, newPath)
  }

  onFocus(event) {
    this.setState({
      placeholder: ''
    })
  }

  onBlur(event) {
    this.setState({
      placeholder: this.props.placeholder
    })
  }

  onQueryChange(event) {
    const query = event.target.value

    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId)
    }

    const timeoutId = setTimeout(() => {
      this.submitQuery(query)
    }, this.props.timeout)

    this.setState({
      query: query,
      timeoutId: timeoutId
    })
  }

  render() {
    return (
      <div>
        <input type="text"
          className="form-control form-control-sm"
          placeholder={this.state.placeholder} 
          name="query" value={this.state.query}
          onChange={this.onQueryChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur} />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar)
