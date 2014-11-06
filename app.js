#!/usr/bin/env node
/**
 * @author Alexander Marenin
 * @date November 2014
 */

var program = require( 'commander' ),
    util = require( './lib/util' ),
    packageInfo = util.getPackageInfo(),
    registry = require( './lib/registry' );


program
    .version( packageInfo.version )
    .usage( '[options]' )
    .option( '-c, --config [name]', 'set the config name to use, default is "dev"', 'dev' );


program.parse( process.argv );
var config = util.getConfig( program.config );
process.title = config.processTitle;
registry.set( 'config', config );


var ScreenShoter = require( './lib/ScreenShoter' ),
    screenShoter = new ScreenShoter({
        stdoutPath: config.stdoutPath,
        stderrPath: config.stderrPath,
        screenshoterPath: config.screenshoterPath,
        outDir: config.outDir
    });
registry.set( 'screenShoter', screenShoter );
screenShoter.startLoop( config.screenshoterInterval );


var server = require( './lib/webServer' );
server( function( error ){
    if ( error )
        util.abort( error );
    else
        console.log( 'Server listening on port %s', config.port );
});
