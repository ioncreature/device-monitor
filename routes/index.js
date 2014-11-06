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
    httpError = require( '../lib/http-error' ),
    config = registry.get( 'config' ),
    route = config.route;

module.exports = router;


router.get( route.INDEX, function( req, res ){
    var list = fs.readdirSync( config.screenshotDir );

    async.map( list,
        function( item, cb ){
            fs.stat( join(config.screenshotDir, item), cb );
        },
        function( error, stats ){
            var now = Date.now();
            res.render( 'page/index', {
                pageName: 'index',
                images: stats.map( function( stat, i ){
                    return {
                        name: list[i],
                        url: util.formatUrl( route.DEVICE_SCREENSHOT, {name: list[i]} ),
                        elapsed: makeTime( now - stat.mtime.getTime() ),
                        old: now - stat.mtime.getTime() > config.screenshoterInterval
                    };
                })
            });
        }
    );
});


router.get( route.DEVICE_SCREENSHOT, function( req, res, next ){
    var name = req.params.name,
        path = join( config.screenshotDir, name ),
        files = fs.readdirSync( path ),
        fileName = files.length && join( path, files[0] );

    if ( fileName ){
        res.type( mime.lookup(fileName) );
        res.set( 'Content-Disposition', 'filename="' + fileName + '"' );
        res.send( fs.readFileSync(fileName) );
    }
    else
        next( new httpError.NotFound );
});


function makeTime( time ){
    var hours = Math.floor( time/ (3600 * 1000) ),
        minutes = Math.floor( time % (3600 * 1000) / (60 * 1000) ),
        seconds = Math.floor( time % (3600 * 1000) % (60 * 1000) / 1000 );
    return hours + 'h ' + minutes + 'm ' + seconds + 's'
}