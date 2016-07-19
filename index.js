#!/usr/bin/env casperjs

var config = require('./config');
var casperInit = require('casper');
var includes = require('lodash.includes');
var fs = require('fs');
var qs = require('qs');
var server = require('webserver').create();
var urldecode = require('urldecode');
var urlParse = require('url-parse');

server.listen(config.ip + ':' + config.port, function (request, response) {
    var casper = casperInit.create({
        exitOnError: false,
        logLevel: (config.debug ? 'debug' : 'error'),
        verbose: config.debug
    });

    var parsedQueryString = qs.parse(urlParse(request.url).query.slice(1)),
        element = urldecode(parsedQueryString.element),
        width = parseInt(parsedQueryString.width),
        height = parseInt(parsedQueryString.height),
        url = urldecode(parsedQueryString.url),
        selectorsToRemove = urldecode(parsedQueryString.remove).split(','),
        filename = new Date().toISOString().replace(/\D/g, '') + '.png',
        imagePath = config.imageDir + filename,
        parsedTargetUrl = urlParse(url);

    // Check hostname agains allowed target hosts
    if (!includes(config.allowedTargetHosts, parsedTargetUrl.hostname)) {
        response.statusCode = 404;
        response.closeGracefully();
        cb();
        return;
    }

    casper.options.viewportSize = { width: width, height: height };
    casper.start(url, function() {
        // Try to wait for whole page to load
        this.wait(config.wait);

        // Remove selectors as passed
        this.then(function () {
            for (var i = 0; i < selectorsToRemove.length; i++) {
                if (this.exists(selectorsToRemove[i])) {
                    this.evaluate(function (selector) {
                        var toDelete = document.querySelector(selector);
                        toDelete.parentNode.removeChild(toDelete);
                    }, selectorsToRemove[i]);
                }
            }
        });

        // Save image
        this.then(function () {
            this.captureSelector(imagePath, element);
        });
    });

    casper.run(function (cb) {
        // Load saved image
        if (!fs.exists(imagePath)) {
            response.statusCode = 404;
            response.closeGracefully();
            cb();
            return;
        }
        var image = fs.open(imagePath, 'rb');
        var imageData = image.read();
        image.close();

        // Send image url as response
        response.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        });
        response.write(JSON.stringify({
            url: config.imageBaseUrl + filename  
        }));
        response.close();
    });
});
