/**
 * @author Alexander Marenin
 * @date July 2014
 */

var router = require( 'express' ).Router(),
    fs = require( 'fs' ),
    mime = require( 'mime' ),
    registry = require( '../lib/registry' ),
    util = require( '../lib/util' ),
    async = require( 'async' ),
    join = require( 'path' ).join,
    basename = require( 'path' ).basename,
    httpError = require( '../lib/http-error' ),
    config = registry.get( 'config' ),
    screenShooter = registry.get( 'screenShooter' ),
    route = config.route;

module.exports = router;


router.get( route.INDEX, function( req, res ){
    var now = Date.now(),
        list = fs.readdirSync( config.screenshotDir ),
        oldCount = 0,
        noImageCount = 0,
        images = list.map( function( name ){
            var path = join( config.screenshotDir, name, '1.png' ),
                exists = fs.existsSync( path ),
                stat = exists && fs.statSync( path ),
                isOld = exists ? now - stat.mtime.getTime() > config.screenshoterObsoleteTime : false;

            if ( isOld )
                oldCount ++;

            if ( !exists )
                noImageCount ++;

            return {
                name: name,
                haveScreenshot: exists,
                url: util.formatUrl( route.DEVICE_SCREENSHOT, {name: name} ),
                elapsed: exists ? makeTime( now - stat.mtime.getTime() ) : 'unknown',
                state: exists ? (isOld ? 'old' : 'ok') : 'no-screenshot',
                isOld: isOld
            };
        });

    res.render( 'page/index', {
        pageName: 'index',
        isRunning: screenShooter.isRunning(),
        lastStart: screenShooter.start ? makeTime( Date.now() - screenShooter.start ) : '-',
        nextRunIn: screenShooter.loopStarted() && makeTime( screenShooter.whenNextLoop() - Date.now() ),
        totalCount: images.length,
        oldCount: oldCount,
        noImageCount: noImageCount,
        images: images
    });
});


router.get( route.DEVICE_SCREENSHOT, function( req, res, next ){
    var name = req.params.name,
        path = join( config.screenshotDir, name ),
        files = fs.readdirSync( path ),
        fileName = files.length && join( path, files[0] );

    if ( fileName ){
        res.type( mime.lookup(fileName) );
        res.set( 'Content-Disposition', 'filename="' + basename(fileName) + '"' );
        res.send( fs.readFileSync(fileName) );
    }
    else
        next( new httpError.NotFound );
});


router.get( route.COLLECT_SCREENSHOTS, function( req, res, next ){
    if ( !screenShooter.isRunning() ){
        screenShooter.collect();
        screenShooter.restartLoop();
    }
    res.redirect( route.INDEX );
});


router.get( route.LOG, function( req, res, next ){
    res.render( 'page/log', {
        pageName: 'log',
        stdout: fs.readFileSync( config.stdoutPath ),
        stderr: fs.readFileSync( config.stderrPath )
    });
});


function makeTime( time ){
    var hours = Math.floor( time/ (3600 * 1000) ),
        minutes = Math.floor( time % (3600 * 1000) / (60 * 1000) ),
        seconds = Math.floor( time % (3600 * 1000) % (60 * 1000) / 1000 );

    return (hours ? hours + 'h ' : '') + minutes + 'm ' + seconds + 's'
}