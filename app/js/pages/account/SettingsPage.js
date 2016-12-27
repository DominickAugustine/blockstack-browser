import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import RadioGroup from 'react-radio-group'
import { SELF_HOSTED_S3, BLOCKSTACK_INC, DROPBOX } from '../../utils/storage/index'
import { DROPBOX_APP_ID, getDropboxAccessTokenFromHash } from '../../utils/storage/dropbox'

import {
  InputGroup, AccountSidebar, SaveButton, PageHeader
} from '../../components/index'
import { SettingsActions } from '../../store/settings'

var Dropbox = require('dropbox')


function mapStateToProps(state) {
  return {
    api: state.settings.api
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch)
}

class SettingsPage extends Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    updateApi: PropTypes.func.isRequired,
    resetApi: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      api: this.props.api
    }


    this.onValueChange = this.onValueChange.bind(this)
    this.updateApi = this.updateApi.bind(this)
    this.resetApi = this.resetApi.bind(this)
    this.onHostedDataValueChange = this.onHostedDataValueChange.bind(this)
    this.connectDropbox = this.connectDropbox.bind(this)
    this.disconnectDropbox = this.disconnectDropbox.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      api: nextProps.api
    })
  }

  componentDidMount() {
    let api = this.state.api
    const dropboxAccessToken = getDropboxAccessTokenFromHash(window.location.hash)
    if(dropboxAccessToken != null) {
      api['dropboxAccessToken'] = dropboxAccessToken
      this.setState({ api: api })
      window.location.hash = ""
      this.props.updateApi(api)
    }
  }

  onValueChange(event) {
    let api = this.state.api
    api[event.target.name] = event.target.value
    this.setState({ api: api })
  }

  onHostedDataValueChange(value) {
    let api = this.state.api
    api['hostedDataLocation'] = value
    this.setState({ api: api })
  }

  updateApi() {
    const api = this.state.api
    this.props.updateApi(api)
  }

  resetApi() {
    this.props.resetApi()
  }

  connectDropbox() {
    var dbx = new Dropbox({ clientId: DROPBOX_APP_ID })
    window.location = dbx.getAuthenticationUrl('http://localhost:3000/account/settings')
  }
  disconnectDropbox() {
    let api = this.state.api
    var dbx = new Dropbox({ accessToken: api.dropboxAccessToken })
    dbx.authTokenRevoke()
    api.dropboxAccessToken = null
    this.setState({ api: api })
    this.props.updateApi(api)
  }

  render() {
    return (
      <div className="body-inner body-inner-white">
        <PageHeader title="Settings" />
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <AccountSidebar activeTab="settings" />
            </div>
            <div className="col-md-9">
              <div>
                <h5>Blockstack API Options</h5>

                { this.state.api.apiCustomizationEnabled === true ?
                  <div>
                    <InputGroup name="nameLookupUrl" label="Name Lookup URL"
                      data={this.state.api} onChange={this.onValueChange} />
                    <InputGroup name="searchUrl" label="Search URL"
                      data={this.state.api} onChange={this.onValueChange} />
                    <InputGroup name="registerUrl" label="Register URL"
                      data={this.state.api} onChange={this.onValueChange} />
                    <InputGroup name="addressLookupUrl" label="Address Names URL"
                      data={this.state.api} onChange={this.onValueChange} />
                  </div>
                : null }

                <h5>Data Hosting Options</h5>

                <RadioGroup name="hostedDataLocation"
                  selectedValue={this.state.api.hostedDataLocation}
                  onChange={this.onHostedDataValueChange}>
                  {Radio => (
                    <div>
                      <div className="radio">
                        <label>
                          <Radio value={BLOCKSTACK_INC} name="hostedDataLocation" />
                          Host data on Amazon S3 through Blockstack Inc.
                        </label>
                      </div>
                      <div className="radio">
                        <label>
                          <Radio value={DROPBOX} name="hostedDataLocation" />
                          Self-host data on Dropbox
                        </label>
                      </div>
                    </div>
                  )}
                </RadioGroup>

                { this.state.api.hostedDataLocation === DROPBOX ?
                  <div>
                      { this.state.api.dropboxAccessToken == null ?
                        <button onClick={this.connectDropbox} className="btn btn-default">
                        Connect Dropbox
                        </button>
                      :
                      <button onClick={this.disconnectDropbox} className="btn btn-default">
                      Disconnect Dropbox
                      </button>
                      }
                  </div>
                : null }

                <hr />

                <div className="form-group">
                  <SaveButton onSave={this.updateApi} />
                </div>

                <p>
                  <button onClick={this.resetApi} className="btn btn-outline-primary">
                    Reset API
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage)
