/**
 * @author Alexander Marenin
 * @date November 2014
 */

var join = require( 'path' ).join;

exports.title = 'Device Monitor';

exports.processTitle = 'device-monitor';

exports.screenshotDir = join( __dirname, '../public/screenshot' );

exports.cookieTtl = 6 * 3600 * 1000;

exports.proxyUsed = false;

exports.route = {
    INDEX: '/',
    DEVICE_SCREENSHOT: '/device/:name/screenshot',
    PUBLIC: '/public',
    PUBLIC_CSS: '/public/css'
};
