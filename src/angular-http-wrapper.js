'use strict';

angular.module('sysofwan.httpWrapper', [])

.provider('httpWrapper', function() {

  var baseUrl = '';

  return {
    setBaseUrl: function(url) {
      baseUrl = url;
    },
    $get: function($http, $location) {

      var transformToBaseUrl = function(url) {
        if (baseUrl && url.charAt(0) === '/' &&
          (url.length === 1 || url.charAt(1) !== '/')) {
          return '//' + $location.host() + baseUrl + url.substring(1);
        }
        return url;
      };

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
        templateUrl = transformToBaseUrl(templateUrl);

        return templateUrl;

      };

      var getParams = function(defaultParams, params) {
        defaultParams = defaultParams || {};
        params = params || {};
        return angular.extend({}, defaultParams, params);
      };

      var getParamConfig = function(params, config) {
        config = config || {};
        return angular.extend({}, config, {
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

      var hashFunc = function(str) {
        var hash = 0,
          i, chr, len;
        if (str.length === 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
          chr = str.charCodeAt(i);
          hash = ((hash * 31) + chr) % 4e+9;
        }
        return hash;
      };

      var createRequestFunc = function createRequestFunc(reqFunc, params, config, modifiers) {
        params = params || {};
        config = config || {};
        modifiers = modifiers || [];
        var hash;
        var func = function(newparams, newconfig) {
          newparams = angular.extend({}, params, newparams);
          newconfig = angular.extend({}, config, newconfig);
          return reqFunc(newparams, newconfig).then(function(result) {
            angular.forEach(modifiers, function(func) {
              result = func(result);
            });
            return result;
          });
        };

        func.modify = function(modifier) {
          return createRequestFunc(reqFunc, params, config, modifiers.concat(modifier));
        };

        func.partial = function(addParams, addConfig) {
          addParams = addParams || {};
          addConfig = addConfig || {};
          addParams = angular.extend({}, params, addParams);
          addConfig = angular.extend({}, config, addConfig);
          return createRequestFunc(reqFunc, addParams, addConfig, modifiers);
        };
        func.url = function() {
          return reqFunc.url(params, config);
        };
        func.hash = function() {
          if (!hash) {
            var str = this.url();
            angular.forEach(modifiers, function(fn) {
              str += fn.toString();
            });
            hash = hashFunc(str);
          }
          return hash;
        };
        return func;
      };

      var getRequest = function(url, defaultParams, defaultConfig) {
        var func = function(params, config) {
          params = params || {};
          var actualUrl = toActualParamsAndUrl(url, params);
          config = getParamConfig(params, config);
          return $http.get(actualUrl, config)
            .then(handleSuccess);
        };
        func.url = function(params) {
          params = angular.copy(params);
          return toActualParamsAndUrl(url, params);
        };

        return createRequestFunc(func, defaultParams, defaultConfig);
      };


      var dataRequest = function(httpFunc) {
        return function(url, defaultParams, defaultConfig) {
          var func = function(data, config) {
            data = data || {};
            config = config || {};
            var actualUrl = toActualParamsAndUrl(url, data);
            return httpFunc(actualUrl, data, config)
              .then(handleSuccess);
          };

          func.url = function(params) {
            params = angular.copy(params);
            return toActualParamsAndUrl(url, params);
          };

          return createRequestFunc(func, defaultParams, defaultConfig);
        };
      };

      return {
        get: getRequest,

        delete: dataRequest($http.delete),

        post: dataRequest($http.post),

        put: dataRequest($http.put),

        patch: dataRequest($http.patch)
      };
    }
  };
});