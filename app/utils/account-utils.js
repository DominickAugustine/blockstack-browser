import bip39 from 'bip39'

const backupPhraseLength = 24

export function isPasswordValid(password) {
  let isValid = false,
      error = null

  if (password.length >= 8) {
    isValid = true
    error = 'Password must be at least 8 characters'
  }

  return { isValid: isValid, error: error }
}

export function isBackupPhraseValid(backupPhrase) {
  let isValid = true,
      error = null

  if (backupPhrase.split(' ').length !== backupPhraseLength) {
    isValid = false
    error = `Backup phrase must be ${backupPhraseLength} words long`
  } else if (!bip39.validateMnemonic(backupPhrase)) {
    isValid = false
    error = 'Backup phrase is not a valid set of words'
  }

  return { isValid: isValid, error: error }
}

export function getProofStatementFromHtml(proofHtml, proofHtmlClasses) {
  let proofStatement = ''

  let page = document.createElement('html')
  page.innerHTML = proofHtml
  let currentElement = page

  proofHtmlClasses.map((proofHtmlClass) => {
    let results = currentElement.getElementsByClassName(proofHtmlClass)
    if (results.length > 0) {
      currentElement = results[0]
    }
  })

  if (currentElement && currentElement.innerHTML) {
    proofStatement = currentElement.innerHTML
  }

  if (proofStatement === undefined) {
    proofStatement = ''
  }

  return proofStatement
}

export function isProofStatementValid(domainName, proofStatement) {
  if (proofStatement === '') {
    return false
  }

  proofStatement = proofStatement.toLowerCase()

  const username = domainName.split('.')[0]
  const proofTemplates = [
    `verifying that ${domainName} is my blockstack id`,
    `verifying that "${domainName}" is my blockstack id`,
    `verifying that +${username} is my blockchain id`,
    `verifying myself: my bitcoin username is +${username}`,
    `verifying myself: my bitcoin username is ${username}`,
    `verifying that +${username} is my bitcoin username`,
    `verifying that ${username} is my bitcoin username`,
    `verifying myself: my openname is ${username}`,
    `verifying that ${username} is my openname`,
    `verifying that +${username} is my openname`,
    `verifying i am +${username} on my passcard`
  ]

  let isValid = false

  proofTemplates.map((proofTemplate) => {
    if (proofStatement.indexOf(proofTemplate) > -1) {
      isValid = true
      return
    }
  })

  return isValid
}

export function isValidProof(domainName, account, callback) {
  // Perform checks on the account service
  if (!webAccountTypes.hasOwnProperty(account.service)) {
    callback(false)
    return
  }
  // Perform checks on the account identifier
  if (!account.identifier) {
    callback(false)
    return
  }
  // Perform checks on the account proof url
  if (!(account.proofUrl && account.proofUrl !== undefined && account.proofUrl.length > 0)) {
    callback(false)
    return
  }

  const webAccount = webAccountTypes[account.service]

  if (!(webAccount.hasOwnProperty('urlTemplate') &&
        webAccount.hasOwnProperty('proofHtmlSelectors'))) {
    callback(false)
    return
  }

  let urlTemplate = webAccount.urlTemplate,
      proofHtmlSelectors = webAccount.proofHtmlSelectors
  let urlPrefix = urlTemplate.replace('{identifier}', account.identifier)

  if (account.proofUrl.indexOf(urlPrefix) !== 0) {
    callback(false)
    return
  }

  fetch(account.proofUrl)
    .then((response) => response.text())
    .then((responseText) => {
      let proofHtml = responseText

      let proofStatement = getProofStatementFromHtml(proofHtml, proofHtmlSelectors)
      let proofStatementIsValid = isProofStatementValid(domainName, proofStatement)

      console.log('here')
      console.log(account.service)
      console.log(proofStatementIsValid)

      callback(proofStatementIsValid)
      return
    })
    /*.catch((error) => {
      console.warn(error)
      callback(false)
    })*/
}

export function getVerifications(domainName, profile, callback) {
  let accounts = profile.account

  accounts.map((account) => {
    isValidProof(domainName, account, (isValid) => {
      account.verified = isValid
    })
  })

  callback(accounts)
}

export const webAccountTypes = {
  'twitter': {
    label: 'Twitter', iconClass: 'fa-twitter', social: true,
    urlTemplate: 'https://twitter.com/{identifier}',
    proofHtmlSelectors: ['permalink-tweet-container', 'js-tweet-text-container']
  },
  'facebook': {
    label: 'Facebook', iconClass: 'fa-facebook', social: true,
    urlTemplate: 'https://facebook.com/{identifier}',
    proofHtmlSelectors: ['_5pbx userContent']
  },
  'github': {
    label: 'GitHub', iconClass: 'fa-github-alt', social: true,
    urlTemplate: 'https://github.com/{identifier}',
    proofHtmlSelectors: ['blob-wrapper data type-markdown js-blob-data']
  },
  'instagram': {
    label: 'Instagram', iconClass: 'fa-instagram', social: true,
    urlTemplate: 'https://instagram.com/{identifier}'
  },
  'linkedin': {
    label: 'LinkedIn', iconClass: 'fa-linkedin', social: true,
    urlTemplate: 'https://www.linkedin.com/in/{identifier}'
  },
  'tumblr': {
    label: 'Tumblr', iconClass: 'fa-tumblr', social: true,
    urlTemplate: 'http://{identifier}.tumblr.com'
  },
  'reddit': {
    label: 'Reddit', iconClass: 'fa-reddit-alien', social: true,
    urlTemplate: 'https://www.reddit.com/user/{identifier}'
  },
  'pinterest': {
    label: 'Pinterest', iconClass: 'fa-pinterest', social: true,
    urlTemplate: 'https://pinterest.com/{identifier}'
  },
  'youtube': {
    label: 'YouTube', iconClass: 'fa-youtube', social: true,
    urlTemplate: 'https://www.youtube.com/channel/{identifier}'
  },
  'google-plus': {
    label: 'Google+', iconClass: 'fa-google-plus', social: true,
    urlTemplate: 'https://plus.google.com/u/{identifier}'
  },
  'angellist': {
    label: 'AngelList', iconClass: 'fa-angellist', social: true,
    urlTemplate: 'https://angel.co/{identifier}'
  },
  'stack-overflow': {
    label: 'StackOverflow', iconClass: 'fa-stack-overflow', social: true,
    urlTemplate: 'http://stackoverflow.com/users/{identifier}'
  },
  'hacker-news': {
    label: 'Hacker News', iconClass: 'fa-hacker-news', social: true,
    urlTemplate: 'https://news.ycombinator.com/user?id={identifier}'
  },
  'openbazaar': {
    label: 'OpenBazaar', iconClass: 'fa-shopping-cart', social: true,
    urlTemplate: 'ob://{identifier}'
  },
  'snapchat': {
    label: 'Snapchat', iconClass: 'fa-snapchat-ghost', social: true,
    urlTemplate: 'https://snapchat.com/add/{identifier}'
  },
  'website': {
    label: 'Website', iconClass: 'fa-link', social: false,
    urlTemplate: '{identifier}'
  },
  'pgp': {
    label: 'PGP', iconClass: 'fa-key', social: false,
    urlTemplate: 'https://pgp.mit.edu/pks/lookup?search={identifier}&op=vindex&fingerprint=on'
  },
  'bitcoin': {
    label: 'Bitcoin', iconClass: 'fa-bitcoin', social: false,
    urlTemplate: 'https://www.blocktrail.com/BTC/address/{identifier}'
  },
  'ethereum': {
    label: 'Ethereum', iconClass: 'fa-key', social: false,
    urlTemplate: 'https://tradeblock.com/ethereum/account/{identifier}'
  }
}
