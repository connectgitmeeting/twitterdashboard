const request = require('request')
const queryString = require('query-string')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter')
const httpAuth = require('http-auth')

require('dotenv').config()

var auth = {}


const RequiredEnv = [
  'TWITTER_CONSUMER_KEY',
  'TWITTER_CONSUMER_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'TWITTER_WEBHOOK_ENV',
]

/*if (!RequiredEnv.every(key => typeof process.env[key] !== 'undefined')) {
  console.error(`One of more of the required environment variables (${RequiredEnv.join(', ')}) are not defined. Please check your environment and try again.`)
  process.exit(-1)
}*/

// twitter info
auth.twitter_oauth = {
  consumer_key: 'gKeONkA8ysYPOoPC0wsBD505Y',
  consumer_secret: 'd3MLrmVw44N5tRkV8vxZGF62Hyi7E3GH5zC93eR9qPW0DFUxdl',
  token: '1497107804381130752-hvyQCDefazNcfHHfbnASWvoTjKcik0',
  token_secret: 'RKwjnYC4PD7zQf276y9OOt1eFFpWitVEHHxsDwDIC5Z6R'
}
auth.twitter_webhook_environment = 'Development'


// basic auth middleware for express

if (typeof 'admin' !== 'undefined' &&
  typeof 'bluebird' !== 'undefined') {
    auth.basic = httpAuth.connect(httpAuth.basic({
        realm: 'admin-dashboard'
    }, function(username, password, callback) {
        callback(username === 'admin' && password === 'bluebird')
    }))
} else {
  console.warn([
    'Your admin dashboard is accessible by everybody.',
    'To restrict access, setup BASIC_AUTH_USER and BASIC_AUTH_PASSWORD',
    'as environment variables.',
    ].join(' '))
}


// csrf protection middleware for express
auth.csrf = require('csurf')()


// Configure the Twitter strategy for use by Passport.
passport.use(new TwitterStrategy({
    consumerKey: auth.twitter_oauth.consumer_key,
    consumerSecret: auth.twitter_oauth.consumer_secret,
    // we want force login, so we set the URL with the force_login=true
    userAuthorizationURL: 'https://api.twitter.com/oauth/authenticate?force_login=true'
  },
  // stores profile and tokens in the sesion user object
  // this may not be the best solution for your application
  function(token, tokenSecret, profile, cb) {
    return cb(null, {
      profile: profile,
      access_token: token,
      access_token_secret: tokenSecret
    })
  }
))

// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
  cb(null, user);
})

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
})


/**
 * Retrieves a Twitter Sign-in auth URL for OAuth1.0a
 */
auth.get_twitter_auth_url = function (host, callback_action) {

  // construct request to retrieve authorization token
  var request_options = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    oauth: {
      callback: 'https://' + host + '/callbacks/twitter/' + callback_action,
      consumer_key: auth.twitter_oauth.consumer_key,
      consumer_secret: auth.twitter_oauth.consumer_secret
    }
  }

  return new Promise (function (resolve, reject) {
    request(request_options, function(error, response) {
      if (error) {
        reject(error)
      }
      else {
        // construct sign-in URL from returned authorization token
        var response_params = queryString.parse(response.body)
        console.log(response_params)
        var twitter_auth_url = 'https://api.twitter.com/oauth/authenticate?force_login=true&oauth_token=' + response_params.oauth_token

        resolve({
          response_params: response_params,
          twitter_auth_url: twitter_auth_url
        })
      }
    })
  })
}


/**
 * Retrieves a bearer token for OAuth2
 */
auth.get_twitter_bearer_token = function () {

  // just return the bearer token if we already have one
  if (auth.twitter_bearer_token) {
    return new Promise (function (resolve, reject) {
      resolve(auth.twitter_bearer_token)
    })
  }

  // construct request for bearer token
  var request_options = {
    url: 'https://api.twitter.com/oauth2/token',
    method: 'POST',
    auth: {
      user: auth.twitter_oauth.consumer_key,
      pass: auth.twitter_oauth.consumer_secret
    },
    form: {
      'grant_type': 'client_credentials'
    }
  }

  return new Promise (function (resolve, reject) {
    request(request_options, function(error, response) {
      if (error) {
        reject(error)
      }
      else {
        var json_body = JSON.parse(response.body)
        console.log("Bearer Token:", json_body.access_token)
        auth.twitter_bearer_token = json_body.access_token
        resolve(auth.twitter_bearer_token)
      }
    })
  })
}


module.exports = auth
