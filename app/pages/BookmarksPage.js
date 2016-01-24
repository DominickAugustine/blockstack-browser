import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import ListItem from '../components/ListItem'
import { NavigationActions } from '../store/navigation'

function mapStateToProps(state) {
  return {
    bookmarks: state.settings.bookmarks
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(NavigationActions, dispatch)
}

class BookmarksPage extends Component {
  static propTypes = {
    updateLocation: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.updateLocation('local://bookmarks')
  }

  render() {
    return (
      <div>
        <h4 className="headspace inverse">Bookmarks</h4>

        <div style={{paddingBottom: '15px'}}>
          <ul className="list-group bookmarks-temp">
          { this.props.bookmarks.map(function(bookmark, index) {
            return (
              <ListItem
                key={index}
                label={ bookmark.label }
                url={"/profile/" + bookmark.id} />
            )
          })}
          </ul>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksPage)
