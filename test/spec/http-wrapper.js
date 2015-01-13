'use strict';

describe('Module: httpWrapper', function() {
  var $httpBackend, httpWrapper, getRequestHandler, postRequestHandler;

  // load the controller's module
  beforeEach(module('sysofwan.httpWrapper'));

  beforeEach(inject(function($injector, _httpWrapper_) {
    httpWrapper = _httpWrapper_;
    $httpBackend = $injector.get('$httpBackend');
    getRequestHandler = $httpBackend.when('GET', /[\s\S]*/).respond({
      message: 'hi!'
    });
    postRequestHandler = $httpBackend.when('POST', /[\s\S]*/).respond({
      message: 'hi!'
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should create a get request', function() {
    var req = httpWrapper.get('/test');
    $httpBackend.expectGET('/test');
    req();
    $httpBackend.flush();
  });

  it('should create a post request', function() {
    var req = httpWrapper.post('/test');
    $httpBackend.expectPOST('/test');
    req();
    $httpBackend.flush();
  });

  it('should have correct default get parameters', function() {
    var req = httpWrapper.get('/test', {
      message: 'testing'
    });
    $httpBackend.expectGET('/test?message=testing');
    req();
    $httpBackend.flush();
  });

  it('should have correct default post data', function() {
    var req = httpWrapper.post('/test', {
      message: 'testing'
    });
    $httpBackend.expectPOST('/test', {
      message: 'testing'
    });
    req();
    $httpBackend.flush();
  });

  it('should have correct interpolation on get', function() {
    var req = httpWrapper.get('/test/:message', {
      message: 'testing'
    });
    $httpBackend.expectGET('/test/testing');
    req();
    $httpBackend.flush();

    req = httpWrapper.get('/:message/test', {
      message: 'testing'
    });
    $httpBackend.expectGET('/testing/test');
    req();
    $httpBackend.flush();

    req = httpWrapper.get('/:message1/:message2', {
      message1: 'testing1',
      message2: 'testing2'
    });
    $httpBackend.expectGET('/testing1/testing2');
    req();
    $httpBackend.flush();

    req = httpWrapper.get('/test/:message.json', {
      message: 'testing'
    });
    $httpBackend.expectGET('/test/testing.json');
    req();
    $httpBackend.flush();

    req = httpWrapper.get('/:message1/:message2', {
      message1: 'testing1'
    });
    $httpBackend.expectGET('/testing1');
    req();
    $httpBackend.flush();

    req = httpWrapper.get('/:message1', {
      message1: 'testing1',
      message2: 'testing2'
    });
    $httpBackend.expectGET('/testing1?message2=testing2');
    req();
    $httpBackend.flush();
  });

  it('should have correct interpolation on post', function() {
    var req = httpWrapper.post('/test/:message', {
      message: 'testing'
    });
    $httpBackend.expectPOST('/test/testing');
    req();
    $httpBackend.flush();

    req = httpWrapper.post('/:message/test', {
      message: 'testing'
    });
    $httpBackend.expectPOST('/testing/test');
    req();
    $httpBackend.flush();

    req = httpWrapper.post('/:message1/:message2', {
      message1: 'testing1',
      message2: 'testing2'
    });
    $httpBackend.expectPOST('/testing1/testing2');
    req();
    $httpBackend.flush();

    req = httpWrapper.post('/test/:message.json', {
      message: 'testing'
    });
    $httpBackend.expectPOST('/test/testing.json');
    req();
    $httpBackend.flush();

    req = httpWrapper.post('/:message1/:message2', {
      message1: 'testing1'
    });
    $httpBackend.expectPOST('/testing1');
    req();
    $httpBackend.flush();

    req = httpWrapper.post('/:message1', {
      message1: 'testing1',
      message2: 'testing2'
    });
    $httpBackend.expectPOST('/testing1', {
      message2: 'testing2'
    });
    req();
    $httpBackend.flush();
  });

  it('correctly use default parameter and request parameters on get', function() {
    var req = httpWrapper.get('/test/:message', {
      message: 'testing'
    });
    req({
      message: 'testing2'
    });
    $httpBackend.expectGET('/test/testing2');
    $httpBackend.flush();

    req = httpWrapper.get('/test/:message', {
      message: 'testing'
    });
    req({
      message2: 'testing2'
    });
    $httpBackend.expectGET('/test/testing?message2=testing2');
    $httpBackend.flush();

    req = httpWrapper.get('/test/:message2', {
      message: 'testing'
    });
    req({
      message2: 'testing2'
    });
    $httpBackend.expectGET('/test/testing2?message=testing');
    $httpBackend.flush();

    req = httpWrapper.get('/:message1/:message2', {
      message1: 'testing1'
    });
    req({
      message2: 'testing2'
    });
    $httpBackend.expectGET('/testing1/testing2');
    $httpBackend.flush();

    req = httpWrapper.get('/:message1/:message2', {
      message1: 'testing1',
      message2: 'testing2'
    });
    req({
      message1: 'testing2',
      message2: 'testing1'
    });
    $httpBackend.expectGET('/testing2/testing1');
    $httpBackend.flush();

    req = httpWrapper.get('/test/:message2', {
      message: 'testing'
    });
    req({
      message2: 'testing2',
      message: 'testing2'
    });
    $httpBackend.expectGET('/test/testing2?message=testing2');
    $httpBackend.flush();

    req = httpWrapper.get('/test/:message', {
      message: 'testing'
    });
    req({
      message2: 'testing2',
      message: 'testing2'
    });
    $httpBackend.expectGET('/test/testing2?message2=testing2');
    $httpBackend.flush();
  });

  it('correctly use default parameter and request parameters on post', function() {
    var req = httpWrapper.post('/test/:message', {
      message: 'testing'
    });
    req({
      message: 'testing2'
    });
    $httpBackend.expectPOST('/test/testing2');
    $httpBackend.flush();

    req = httpWrapper.post('/test/:message', {
      message: 'testing'
    });
    req({
      message2: 'testing2'
    });
    $httpBackend.expectPOST('/test/testing', {
      message2: 'testing2'
    });
    $httpBackend.flush();

    req = httpWrapper.post('/test/:message2', {
      message: 'testing'
    });
    req({
      message2: 'testing2'
    });
    $httpBackend.expectPOST('/test/testing2', {
      message: 'testing'
    });
    $httpBackend.flush();

    req = httpWrapper.post('/:message1/:message2', {
      message1: 'testing1'
    });
    req({
      message2: 'testing2'
    });
    $httpBackend.expectPOST('/testing1/testing2');
    $httpBackend.flush();

    req = httpWrapper.post('/:message1/:message2', {
      message1: 'testing1',
      message2: 'testing2'
    });
    req({
      message1: 'testing2',
      message2: 'testing1'
    });
    $httpBackend.expectPOST('/testing2/testing1');
    $httpBackend.flush();

    req = httpWrapper.post('/test/:message2', {
      message: 'testing'
    });
    req({
      message2: 'testing2',
      message: 'testing2'
    });
    $httpBackend.expectPOST('/test/testing2', {
      message: 'testing2'
    });
    $httpBackend.flush();

    req = httpWrapper.post('/test/:message', {
      message: 'testing'
    });
    req({
      message2: 'testing2',
      message: 'testing2'
    });
    $httpBackend.expectPOST('/test/testing2', {
      message2: 'testing2'
    });
    $httpBackend.flush();
  });

  it('should correctly use default and request config parameters on get', function() {
    var req = httpWrapper.get('/test', {}, {
      headers: {
        food: 'ayam'
      }
    });
    req();
    $httpBackend.expectGET('/test', {
      food: 'ayam',
      Accept: 'application/json, text/plain, */*'
    });
    $httpBackend.flush();

    req({}, {
      headers: {
        food2: 'ikan'
      }
    });
    $httpBackend.expectGET('/test', {
      food2: 'ikan',
      Accept: 'application/json, text/plain, */*'
    });
    $httpBackend.flush();
  });

  it('should correctly use default and request config parameters on post', function() {
    var req = httpWrapper.post('/test', {}, {
      headers: {
        food: 'ayam'
      }
    });
    req();
    $httpBackend.expectPOST('/test', {}, {
      food: 'ayam',
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json;charset=utf-8'
    });
    $httpBackend.flush();

    req({}, {
      headers: {
        food2: 'ikan'
      }
    });
    $httpBackend.expectPOST('/test', {}, {
      food2: 'ikan',
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json;charset=utf-8'
    });
    $httpBackend.flush();
  });

  it('should use params from params parameter, not config on get', function() {
    var req = httpWrapper.get('/test', {
      message: 'message1'
    }, {
      params: {
        message: 'message2'
      }
    });
    req();
    $httpBackend.expectGET('/test?message=message1');
    $httpBackend.flush();
  });

  it('should use data from data parameter, not config on post', function() {
    var req = httpWrapper.post('/test', {
      message: 'testing'
    }, {
      data: {
        message: 'testing2'
      }
    });
    $httpBackend.expectPOST('/test', {
      message: 'testing'
    });
    req();
    $httpBackend.flush();
  });

  it('should successfully transform response data using modifyResults', function() {
    var req = httpWrapper.get('/test');
    var req2 = req.modify(function(data) {
      return 'i changed';
    });
    req2 = req2.modify(function(data) {
      return data + ' i changed too';
    });
    req2().then(function(results) {
      expect(results).toBe('i changed i changed too');
    });
    req().then(function(results) {
      expect(results.message).toBe('hi!');
    });
    $httpBackend.flush();
  });

  it('should give correct url on url method', function() {
    var req = httpWrapper.get('/test');
    expect(req.url()).toBe('/test');

    req = httpWrapper.post('/test2');
    expect(req.url()).toBe('/test2');

    req = req.partial({message: 'test'});
    expect(req.url()).toBe('/test2');

    req = req.modify(function(data) {
      return 'i changed';
    });
    expect(req.url()).toBe('/test2');


    req = httpWrapper.get('/test/:message');
    var req2 = req.partial({message: 'test'});
    expect(req2.url()).toBe('/test/test');
    expect(req.url()).toBe('/test');

    req = httpWrapper.get('/test/:message1/:message2');
    req2 = req.partial({message1: 'test1', message2:'test2'});
    req2 = req2.partial({message2:'test3'});
    expect(req2.url()).toBe('/test/test1/test3');
    expect(req.url()).toBe('/test');

    req2 = req2.modify(function(data) {
      return 'i changed';
    });
    expect(req2.url()).toBe('/test/test1/test3');

    req = req2.partial({message2:'test4'});
    expect(req.url()).toBe('/test/test1/test4');
  });

  it ('should have expected hash behavior', function() {
    var req = httpWrapper.get('/test');
    var req2 = httpWrapper.get('/test2');
    var req3 = httpWrapper.get('/test');
    expect(req.hash()).not.toBe(req2.hash());
    expect(req.hash()).toBe(req3.hash());
    var req4 = req.modify(function(results) {
      return 'abcasdasdas asd asd asdasdasd';
    });
    var req5 = req.modify(function(results) {
      return 'abcasdasdas';
    });
    expect(req4.hash()).not.toBe(req5.hash());

    req = httpWrapper.get('/test/:message1/:message2');
    req2 = req.partial({message1: 'test1', message2:'test2'});
    req2 = req2.partial({message2:'test3'});
    req2 = req2.modify(function(data) {
      return 'i changed';
    });
    req = req2.partial({message2:'test4'});
    expect(req.hash()).not.toBe(req2.hash());

  });
});

describe('Provider tests', function () {
  var $httpBackend, httpWrapper, getRequestHandler, postRequestHandler, provider;

  // load the controller's module
  beforeEach(module('sysofwan.httpWrapper', function(httpWrapperProvider) {
    provider = httpWrapperProvider;
  }));

  beforeEach(inject(function($injector, _httpWrapper_) {
    httpWrapper = _httpWrapper_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', /[\s\S]*/).respond({
      message: 'hi!'
    });
    $httpBackend.when('POST', /[\s\S]*/).respond({
      message: 'hi!'
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have configurable base url', function() {
    provider.setBaseUrl('/test/');
    var req = httpWrapper.get('/');
    expect(req.url()).toBe('//server/test/');
    req = httpWrapper.get('test');
    expect(req.url()).toBe('test');
    req = httpWrapper.get('//test');
    expect(req.url()).toBe('//test');
    req = httpWrapper.get('/test');
    expect(req.url()).toBe('//server/test/test');
  });
});