const request = require('request-promise')
const auth = require('../helpers/auth')
const socket = require('../helpers/socket')
const querystring = require('querystring');


var activity = function (req, resp) {
  var json_response = {
    socket_host: req.headers.host.indexOf('localhost') == 0 ? 'http://' + req.headers.host : 'https://' + req.headers.host,
    activity_event: socket.activity_event
  }
  var json = {
    connectionId: "4499206986795832",
    message: "HIdaddasdadasdad",
  };
  

var body = querystring.stringify(json);
console.log(body)
var path = '/test/lambda/?';
var options = {
    host: "64l1orae1l.execute-api.eu-west-2.amazonaws.com",
    path: path + body,
    method: 'GET',
    // headers: {'Content-Type': 'application/json'}
  };
var callback = function(response) {
var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });
response.on('end', function () {
 
    });
  }
var req = https.request(options, callback);
  req.on('error', function(e) {
    console.log('problem with request: '+ e);
  });
 
  req.write(body);
  req.end();
  resp.render('activity', json_response)
}


module.exports = activity

