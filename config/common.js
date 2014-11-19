/**
 * @author Alexander Marenin
 * @date November 2014
 */

var join = require( 'path' ).join;

exports.title = 'Device Monitor';

exports.processTitle = 'device-monitor';

exports.cookieTtl = 6 * 3600 * 1000;

exports.proxyUsed = false;

exports.screenshotDir = join( __dirname, '../ScreenShots' );

exports.route = {
    INDEX: '/',
    DEVICE: '/device/:name',
    DEVICE_SCREENSHOT: '/device/:name/screenshot',
    COLLECT_SCREENSHOTS: '/collect',
    LOG: '/log',
    PUBLIC: '/public',
    PUBLIC_CSS: '/public/css'
};
