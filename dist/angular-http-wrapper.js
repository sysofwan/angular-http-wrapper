'use strict';

angular.module('sysofwan.httpWrapper', [])

.factory('httpWrapper', ["$http", function($http) {

  var encodeUriSegment = function(val) {
    return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '%20').
    replace(/%26/gi, '&').
    replace(/%3D/gi, '=').
    replace(/%2B/gi, '+');
  };

  // Returns actual url and modifies param object to actual param
  var isUrlParam = function(param, templateUrl) {
    return !(new RegExp('^\\d+$').test(param)) && param &&
      (new RegExp('(^|[^\\\\]):' + param + '(\\W|$)').test(templateUrl));
  };

  var replaceTokens = function(url) {
    url = url.replace(/\/+$/, '') || '/';
    url = url.replace(/\/\.(?=\w+($|\?))/, '.');
    return url.replace(/\/\\\./, '/.');
  };

  var toActualParamsAndUrl = function(templateUrl, params) {
    var urlParamsKeys = [];

    angular.forEach(templateUrl.split(/\W/), function(paramKey) {
      if (isUrlParam(paramKey, templateUrl)) {
        urlParamsKeys.push(paramKey);
      }
    });

    templateUrl = templateUrl.replace(/\\:/g, ':');

    angular.forEach(urlParamsKeys, function(key) {
      var val = params[key];
      if (angular.isDefined(val) && val !== null) {
        templateUrl = templateUrl.replace(new RegExp(':' + key + '(\\W|$)', 'g'), function(match, p1) {
          return encodeUriSegment(val) + p1;
        });
        delete params[key];
      } else {
        templateUrl = templateUrl.replace(new RegExp('(\/?):' + key + '(\\W|$)', 'g'), function(match,
          leadingSlashes, tail) {
          if (tail.charAt(0) === '/') {
            return tail;
          } else {
            return leadingSlashes + tail;
          }
        });
      }
    });

    templateUrl = templateUrl.replace(/\/+$/, '') || '/';
    templateUrl = templateUrl.replace(/\/\.(?=\w+($|\?))/, '.');
    templateUrl = templateUrl.replace(/\/\\\./, '/.');
    return templateUrl;

  };

  var getParams = function(defaultParams, params) {
    defaultParams = defaultParams || {};
    params = params || {};
    return angular.extend(angular.copy(defaultParams), params);
  };

  var getParamConfig = function(params, defaultConfig, config) {
    defaultConfig = defaultConfig || {};
    config = config || {};
    return angular.extend(angular.copy(defaultConfig), config, {
      params: params
    });
  };

  var getDataConfig = function(defaultConfig, config) {
    defaultConfig = defaultConfig || {};
    config = config || {};
    return angular.extend(angular.copy(defaultConfig), config);
  };

  var handleSuccess = function(response) {
    return response.data;
  };

  var dataRequest = function(httpFunc) {
    return function(url, defaultData, defaultConfig) {
      return function(data, config) {
        data = getParams(defaultData, data);
        var actualUrl = toActualParamsAndUrl(url, data);
        config = getDataConfig(defaultConfig, config);
        return httpFunc(actualUrl, data, config)
          .then(handleSuccess);
      };
    };
  };

  return {
    get: function(url, defaultParams, defaultConfig) {
      return function(params, config) {
        params = getParams(defaultParams, params);
        var actualUrl = toActualParamsAndUrl(url, params);
        config = getParamConfig(params, defaultConfig, config);
        return $http.get(actualUrl, config)
          .then(handleSuccess);
      };
    },
    delete: function(url, defaultConfig) {
      return function(params, config) {
        var actualUrl = toActualParamsAndUrl(url, params);
        config = getDataConfig(defaultConfig, config);
        return $http.delete(actualUrl, config)
          .then(handleSuccess);
      };
    },
    post: dataRequest($http.post),
    put: dataRequest($http.post),
    patch: dataRequest($http.post),
    partial: function(requestFunc, addParams, addConfig) {
      addParams = addParams || {};
      addConfig = addConfig || {};
      return function(params, config) {
        params = params || {};
        config = config || {};

        params = angular.extend(angular.copy(addParams), params);
        config = angular.extend(angular.copy(addConfig), config);
        return requestFunc(params, config);
      };
    }
  };

}]);