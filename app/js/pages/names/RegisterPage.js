import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Alert, InputGroup, PageHeader } from '../../components/index'
import { IdentityActions } from '../../store/identities'
import { getNameCost, isNameAvailable, hasNameBeenPreordered } from '../../utils/name-utils'

function mapStateToProps(state) {
  return {
    username: '',
    localIdentities: state.identities.localIdentities,
    lookupUrl: state.settings.api.nameLookupUrl,
    registerUrl: state.settings.api.registerUrl,
    blockstackApiAppId: state.settings.api.blockstackApiAppId,
    blockstackApiAppSecret: state.settings.api.blockstackApiAppSecret,
    analyticsId: state.account.analyticsId,
    identityAddresses: state.account.identityAccount.addresses
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(IdentityActions, dispatch)
}

class RegisterPage extends Component {
  static propTypes = {
    username: PropTypes.string.isRequired,
    localIdentities: PropTypes.object.isRequired,
    lookupUrl: PropTypes.string.isRequired,
    registerUrl: PropTypes.string.isRequired,
    blockstackApiAppId: PropTypes.string.isRequired,
    blockstackApiAppSecret: PropTypes.string.isRequired,
    analyticsId: PropTypes.string.isRequired,
    identityAddresses: PropTypes.array.isRequired,
    registerName: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      registrationLock: false,
      username: this.props.username,
      nameCost: 0,
      alerts: [],
      type: 'person',
      tlds: {
        person: 'id',
        organization: 'corp'
      },
      nameLabels: {
        person: 'Username',
        organization: 'Domain'
      }
    }

    this.onChange = this.onChange.bind(this)
    this.registerIdentity = this.registerIdentity.bind(this)
    this.updateAlert = this.updateAlert.bind(this)
  }

  onChange(event) {
    if (event.target.name === 'username') {
      const username = event.target.value.toLowerCase().replace(/\W+/g, ''),
            tld = this.state.tlds[this.state.type],
            nameCost = getNameCost(`${username}.${tld}`) / 1000
      this.setState({
        username: username,
        nameCost: nameCost
      })
    }
  }

  updateAlert(alertStatus, alertMessage) {
    this.setState({
      alerts: [{
        status: alertStatus,
        message: alertMessage
      }]
    })
  }

  registerIdentity(event) {
    if (this.state.registrationLock) {
      return
    }

    this.setState({ registrationLock: true })

    const username = this.state.username,
          tld = this.state.tlds[this.state.type],
          domainName = username + '.' + tld
    
    if (username.length === 0) {
      this.updateAlert('danger', 'Name must have at least one character')
      return
    }

    const nameHasBeenPreordered = hasNameBeenPreordered(
      domainName, this.props.localIdentities)

    if (nameHasBeenPreordered) {
      this.updateAlert('danger', 'Name has already been preordered')
      this.setState({ registrationLock: false })
    } else {
      isNameAvailable(this.props.lookupUrl, domainName, (isAvailable) => {
        if (!isAvailable) {
          this.updateAlert('danger', 'Name has already been registered')
          this.setState({ registrationLock: false })
        } else {
          this.updateAlert('success', 'Name preordered! Waiting for registration confirmation.')
          let address = this.props.identityAddresses[0]
          let tokenFileUrl = 'https://blockstack.s3-us-west-1.amazonaws.com/staging/' + domainName + '.json'
          this.props.registerName(
            domainName, address, tokenFileUrl, this.props.registerUrl,
            this.props.blockstackApiAppId, this.props.blockstackApiAppSecret)
          this.context.router.push('/')
        }
      })
    }

    const analyticsId = this.props.analyticsId
    mixpanel.track('Register identity', { distinct_id: analyticsId })
    mixpanel.track('Perform action', { distinct_id: analyticsId })
  }

  render() {
    let tld = this.state.tlds[this.state.type],
        nameLabel = this.state.nameLabels[this.state.type]

    return (
      <div className="body-inner body-inner-white">
        <PageHeader title="Register" />
        <div className="container">
          <div className="col-sm-3">
          </div>
          <div className="col-sm-6">
            { this.state.alerts.map(function(alert, index) {
              return (
                <Alert key={index} message={alert.message} status={alert.status} />
              )
            })}
            <fieldset className="form-group">
              <label className="capitalize">{nameLabel}</label>
              <div className="input-group">
                <input
                  name="username"
                  className="form-control"
                  placeholder={nameLabel}
                  value={this.state.username}
                  onChange={this.onChange} />
                <span className="input-group-addon">.{tld}</span>
              </div>
            </fieldset>
            <div>
              <button className="btn btn-primary" onClick={this.registerIdentity}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage)

/*
          <div>
            <label>Registration Cost</label>
            <div className="highlight">
              <pre>
                <code>
                  {this.state.nameCost} mBTC
                </code>
              </pre>
            </div>
          </div>

<fieldset className="form-group">
  <select name="type" className="c-select"
    defaultValue={this.state.type} onChange={this.onChange}>
    <option value="person">Person</option>
    <option value="organization">Organization</option>
  </select>
</fieldset>
*/