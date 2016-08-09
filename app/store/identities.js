import { Person, makeZoneFileForHostedProfile } from 'blockstack-profiles'

const UPDATE_CURRENT = 'UPDATE_CURRENT',
      UPDATE_IDENTITIES = 'UPDATE_IDENTITIES',
      CREATE_NEW = 'CREATE_NEW',
      UPDATE_PROFILE = 'UPDATE_PROFILE'

function updateCurrentIdentity(domainName, profile, verifications) {
  return {
    type: UPDATE_CURRENT,
    domainName: domainName,
    profile: profile,
    verifications: verifications
  }
}

function createNewIdentity(domainName) {
  return {
    type: CREATE_NEW,
    domainName: domainName
  }
}

function updateOwnedIdentities(localIdentities, namesOwned) {
  return {
    type: UPDATE_IDENTITIES,
    localIdentities: localIdentities,
    namesOwned: namesOwned
  }
}

function updateProfile(domainName, profile) {
  return {
    type: UPDATE_PROFILE,
    domainName: domainName,
    profile: profile
  }
}

function calculateLocalIdentities(localIdentities, namesOwned) {
  let remoteNamesDict = {},
      localNamesDict = {},
      updatedLocalIdentities = localIdentities

  namesOwned.map(function(name) {
    remoteNamesDict[name] = true
  })

  Object.keys(updatedLocalIdentities).forEach((name) => {
    let identity = updatedLocalIdentities[name]
    localNamesDict[identity.domainName] = true
    if (remoteNamesDict.hasOwnProperty(identity.domainName)) {
      identity.registered = true
    }
  })

  namesOwned.map(function(name) {
    if (!localNamesDict.hasOwnProperty(name)) {
      updatedLocalIdentities[name] = {
        domainName: name,
        profile: {
          '@type': 'Person',
          '@context': 'http://schema.org'
        },
        verifications: [],
        registered: true
      }
    }
  })

  return updatedLocalIdentities
}

function getNamesOwnedFromApiResponse(responseJson) {
  let namesOwned = []
  if (responseJson.hasOwnProperty('results')) {
    responseJson.results.map((addressResult) => {
      if (addressResult.hasOwnProperty('names')) {
        addressResult.names.map((name) => {
          namesOwned.push(name)
        })
      }
    })
  }
  return namesOwned
}

function refreshIdentities(addresses, addressLookupUrl, localIdentities, lastNameLookup) {
  return dispatch => {
    if (addresses.length === 0) {
      let namesOwned = []
      let updatedLocalIdentities = calculateLocalIdentities(localIdentities, namesOwned)
      if (JSON.stringify(updatedLocalIdentities) === JSON.stringify(localIdentities)) {
        // pass
      } else {
        dispatch(updateOwnedIdentities(updatedLocalIdentities, namesOwned))
      }
    } else {
      fetch(addressLookupUrl.replace('{address}', addresses.join(',')))
        .then((response) => response.text())
        .then((responseText) => JSON.parse(responseText))
        .then((responseJson) => {
          let namesOwned = getNamesOwnedFromApiResponse(responseJson),
              updatedLocalIdentities = calculateLocalIdentities(localIdentities, namesOwned)

          if (JSON.stringify(lastNameLookup) === JSON.stringify(namesOwned)) {
            // pass
          } else {
            dispatch(updateOwnedIdentities(updatedLocalIdentities, namesOwned))
          }
        })
        .catch((error) => {
          console.warn(error)
        })
    }
  }
}

function registerName(domainName, recipientAddress, tokenFileUrl, registerUrl,
                      blockstackApiAppId, blockstackApiAppSecret) {
  return dispatch => {
    const zoneFile = makeZoneFileForHostedProfile(domainName, tokenFileUrl),
      authHeader = 'Basic ' + btoa(blockstackApiAppId + ':' + blockstackApiAppSecret)
    fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        username: domainName.split('.')[0],
        recipient_address: recipientAddress,
        profile: zoneFile
      })
    })
      .then((response) => response.text())
      .then((responseText) => JSON.parse(responseText))
      .then((responseJson) => {
        dispatch(createNewIdentity(domainName))
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

function fetchCurrentIdentity(domainName, lookupUrl) {
  return dispatch => {
    const username = domainName.replace('.id', ''),
          url = lookupUrl.replace('{name}', username)
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => JSON.parse(responseText))
      .then((responseJson) => {
        const profile = responseJson[username]['profile'],
              verifications = responseJson[username]['verifications']
        dispatch(updateCurrentIdentity(domainName, profile, verifications))
      })

  }
}

export const IdentityActions = {
  updateCurrentIdentity: updateCurrentIdentity,
  createNewIdentity: createNewIdentity,
  updateProfile: updateProfile,
  fetchCurrentIdentity: fetchCurrentIdentity,
  refreshIdentities: refreshIdentities,
  updateOwnedIdentities: updateOwnedIdentities,
  registerName: registerName
}

const initialState = {
  current: {
    domainName: null,
    profile: null,
    verifications: null
  },
  localIdentities: {},
  lastNameLookup: []
}

export function IdentityReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_CURRENT:
      return Object.assign({}, state, {
        current: {
          domainName: action.domainName,
          profile: action.profile,
          verifications: action.verifications
        }
      })
    case CREATE_NEW:
      return Object.assign({}, state, {
        localIdentities: Object.assign({}, state.localIdentities, {
          [action.domainName]: {
            domainName: action.domainName,
            profile: {
              '@type': 'Person',
              '@context': 'http://schema.org'
            },
            verifications: [],
            registered: false
          }
        })
      })
    case UPDATE_IDENTITIES:
      return Object.assign({}, state, {
        localIdentities: action.localIdentities,
        lastNameLookup: action.namesOwned
      })
    case UPDATE_PROFILE:
      return Object.assign({}, state, {
        localIdentities: Object.assign({}, state.localIdentities, {
          [action.domainName]: Object.assign({}, state.localIdentities[action.domainName], {
            profile: action.profile
          })
        })
      })
    default:
      return state
  }
}

/*{
  domainName: 'ryan.id',
  profile: {},
  verifications: [],
  registered: false,
  blockNumber: null,
  transactionNumber: null
}*/
