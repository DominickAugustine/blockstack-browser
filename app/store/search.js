const UPDATE_RESULTS = 'UPDATE_RESULTS'

function updateResults(results) {
  return {
    type: UPDATE_RESULTS,
    results: results
  }
}

function searchIdentities(query, searchUrl, lookupUrl) {
  return dispatch => {
    let url, username
    if (/^[a-z0-9_-]+.id+$/.test(query)) {
      username = query.replace('.id', '')
      url = lookupUrl.replace('{name}', username)
    } else {
      url = searchUrl.replace('{query}', query).replace(' ', '%20')
    }
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => JSON.parse(responseText))
      .then((responseJson) => {
        let results = []
        if (responseJson.hasOwnProperty('results')) {
          results = responseJson.results
        } else {
          results.push({
            profile: responseJson[username].profile,
            username: username
          })
        }
        dispatch(updateResults(results))
      })
      .catch((error) => {
        console.warn(error)
      })
  }
}

export const SearchActions = {
  updateResults: updateResults,
  searchIdentities: searchIdentities
}

const initialState = {
  results: []
}

export function SearchReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_RESULTS:
      return Object.assign({}, state, {
        results: action.results
      })
    default:
      return state
  }
}