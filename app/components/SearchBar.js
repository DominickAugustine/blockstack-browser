import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { routeActions } from 'react-router-redux'

import { SearchActions } from '../store/search'

function mapStateToProps(state) {
  return {
    location: state.routing.location,
    pathname: state.routing.location.hash
  }
}

function mapDispatchToProps(dispatch) {
  const actions = Object.assign(SearchActions, routeActions)
  return bindActionCreators(actions, dispatch)
}

class SearchBar extends Component {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    timeout: PropTypes.number.isRequired,
    searchIdentities: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired
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

  componentHasNewPathname(newPathname) {
    let pathname = newPathname.split('?')[0].replace('#/', '')
    //console.log(pathname)
    let location = 'local://' + pathname
    if (pathname.includes('profile/')) {
      location = pathname.replace('profile/', '')
    } else if (pathname.includes('search/')) {
      location = pathname.replace('search/', '')
    }
    this.setState({
      query: location
    })
  }

  componentWillMount() {
    this.componentHasNewPathname(this.props.pathname)
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.location)
    if (nextProps.pathname !== this.props.pathname) {
      this.componentHasNewPathname(nextProps.pathname)
    }
  }

  submitQuery(query) {
    const newPath = `search/${query.replace(' ', '%20')}`
    this.context.router.push(newPath)
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
