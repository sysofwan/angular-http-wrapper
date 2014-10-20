'use strict';

angular.module('sysofwan.httpWrapper', [])

.factory('httpWrapper', function($http) {

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
    return angular.extend({}, defaultParams, params);
  };

  var getParamConfig = function(params, defaultConfig, config) {
    defaultConfig = defaultConfig || {};
    config = config || {};
    return angular.extend({}, defaultConfig, config, {
      params: params
    });
  };

  var getDataConfig = function(defaultConfig, config) {
    defaultConfig = defaultConfig || {};
    config = config || {};
    return angular.extend({}, defaultConfig, config);
  };

  var handleSuccess = function(response) {
    return response.data;
  };

  var dataRequest = function(httpFunc) {
    return function(url, defaultData, defaultConfig) {
      var func = function(data, config) {
        data = getParams(defaultData, data);
        var actualUrl = toActualParamsAndUrl(url, data);
        config = getDataConfig(defaultConfig, config);
        return httpFunc(actualUrl, data, config)
          .then(handleSuccess);
      };
      func.url = function(params) {
        params = getParams(params, defaultData);
        return toActualParamsAndUrl(url, params);
      };
      return func;
    };
  };

  return {
    get: function(url, defaultParams, defaultConfig) {
      var func = function(params, config) {
        params = getParams(defaultParams, params);
        var actualUrl = toActualParamsAndUrl(url, params);
        config = getParamConfig(params, defaultConfig, config);
        return $http.get(actualUrl, config)
          .then(handleSuccess);
      };
      func.url = function(params) {
        params = getParams(params, defaultParams);
        return toActualParamsAndUrl(url, params);
      };
      return func;
    },
    
    delete: dataRequest($http.delete),
    
    post: dataRequest($http.post),
    
    put: dataRequest($http.put),
    
    patch: dataRequest($http.patch),
    
    partial: function(requestFunc, addParams, addConfig) {
      addParams = addParams || {};
      addConfig = addConfig || {};
      var func = function(params, config) {
        params = params || {};
        config = config || {};

        params = angular.extend(angular.copy(addParams), params);
        config = angular.extend(angular.copy(addConfig), config);
        return requestFunc(params, config);
      };
      func.url = function(params) {
        params = getParams(params, addParams);
        return requestFunc.url(params);
      };
      return func;
    },

    modifyResults: function(requestFunc, modifyFunc) {
      var func = function(params, config) {
        return requestFunc(params, config).then(modifyFunc);
      };
      func.url = function(params) {
        return requestFunc.url(params);
      };
      return func;
    }
  };

});