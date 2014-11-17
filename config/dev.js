/**
 * @author Alexander Marenin
 * @date November 2014
 */

var join = require( 'path' ).join;

exports.debug = true;

exports.port = 8080;

exports.screenshoterPath = join( __dirname, '../../newScripts/screenShooter.py' );

exports.screenshoterInterval = 60 * 60 * 1000;

exports.screenshoterTimeout = 59 * 60 * 1000;

exports.screenshoterObsoleteTime = 90 * 60 * 1000;

exports.stdoutPath = '../stdout.log';

exports.stderrPath = '../stderr.log';