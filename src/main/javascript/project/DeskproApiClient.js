const http = require("http");
const url = require("url");

/**
 * @param {http.IncomingMessage} message
 * @param {function} resolve
 * @param {function} reject
 */
function requestHandler(message, resolve, reject) {
  let body = '';
  message.on('data', function (chunk) {
    body += chunk;
  });
  message.on('end', function () {
    const result = {
      statusCode: message.statusCode,
      headers: message.headers,
      body: body
    };
    if (-1 === [200, 201].indexOf(result.statusCode)) {
      reject(result);
    } else {
      resolve(result)
    }
  });
}


class DeskproApiClient
{
  /**
   * @param {String} urlString
   * @param {String} authToken
   * @return {DeskproApiClient}
   */
  static createInstance (urlString, authToken) {
    const parsedUrl = url.parse(urlString);
    return new DeskproApiClient(parsedUrl, authToken);
  }

  /**
   * @param {URL} apiUrl
   * @param {String} authToken
   */
  constructor(apiUrl, authToken) {
    this.state = {
      apiUrl: apiUrl,
      authenticationToken: authToken
    }
  }

  /**
   * @param {String} authToken
   * @return {DeskproApiClient}
   */
  authenticate(authToken) {
    return new DeskproApiClient(this.state.apiUrl, authToken);
  }

  /**
   * @param {*} credentials
   * @return {Promise}
   */
  api_tokens(credentials) {

    const requestOptions = {
      hostname: this.state.apiUrl.hostname,
      port: this.state.apiUrl.port,
      method: "POST",
      path: "/api/v2" + "/api_tokens",
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const executor = function (resolve, reject) {
      http
        .request(requestOptions, function (message) {
          requestHandler(message, resolve, reject);
        })
        .end(JSON.stringify(credentials));
    };

    return new Promise(executor);
  }

  /**
   * @param {Buffer} appPackage
   */
  apps(appPackage) {
    const requestOptions = {
      hostname: this.state.apiUrl.hostname,
      port: this.state.apiUrl.port,
      method: "POST",
      path: "/api/v2" + "/apps",
      headers: {
        'Content-Type': 'application/zip',
        'Authorization': 'token ' + this.state.authenticationToken,
      }
    };

    const executor = function (resolve, reject) {
      http
        .request(requestOptions, function (message) {
          requestHandler(message, resolve, reject);
        })
        .end(appPackage);
    };

    return new Promise(executor);
  }
}

module.exports = DeskproApiClient;