import { Person, flattenObject } from 'blockchain-profile'

const UPDATE_CURRENT = 'UPDATE_CURRENT',
      CREATE_NEW = 'CREATE_NEW',
      UPDATE_PROFILE = 'UPDATE_PROFILE'

function updateCurrentIdentity(domain, profile, verifications) {
  return {
    type: UPDATE_CURRENT,
    domain: domain,
    profile: profile,
    verifications: verifications
  }
}

function createNewIdentity(domain) {
  return {
    type: CREATE_NEW,
    domain: domain
  }
}

function updateProfile(index, profile) {
  return {
    type: UPDATE_PROFILE,
    index: index,
    profile: profile
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
        const legacyProfile = responseJson[username]['profile'],
              verifications = responseJson[username]['verifications'],
              profile = Person.fromLegacyFormat(legacyProfile).profile
        dispatch(updateCurrentIdentity(domainName, profile, verifications))
      })
      .catch((error) => {
        console.warn(error)
      })
  }
}

export const IdentityActions = {
  updateCurrentIdentity: updateCurrentIdentity,
  createNewIdentity: createNewIdentity,
  updateProfile: updateProfile,
  fetchCurrentIdentity: fetchCurrentIdentity
}

const initialState = {
  current: {
    id: null,
    profile: null,
    verifications: null
  },
  local: [
    {
      index: 0,
      id: 'ryan.id',
      profile: {},
      verifications: [],
      registered: false
    }
  ],
  registered: []
}

export function IdentityReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_CURRENT:
      return Object.assign({}, state, {
        current: {
          id: action.domain,
          profile: action.profile,
          verifications: action.verifications
        }
      })
    case CREATE_NEW:
      return Object.assign({}, state, {
        local: [
          ...state.local,
          {
            index: state.local.length,
            id: action.domain,
            profile: {},
            verifications: [],
            registered: false
          }
        ]
      })
    case UPDATE_PROFILE:
      return Object.assign({}, state, {
        local: [
          ...state.local.slice(0, action.index),
          Object.assign({}, state.local[action.index], {
            profile: action.profile
          }),
          ...state.local.slice(action.index + 1)
        ]
      })
    default:
      return state
  }
}
