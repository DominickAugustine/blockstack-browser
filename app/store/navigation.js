const UPDATE_LOCATION = 'UPDATE_LOCATION'

function updateLocation(location) {
  return {
    type: UPDATE_LOCATION,
    location: location
  }
}

export const NavigationActions = {
  updateLocation: updateLocation
}

const initialState = {
  location: ''
}

export function NavigationReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_LOCATION:
      return Object.assign({}, state, {
        location: action.location
      })
    default:
      return state
  }
}