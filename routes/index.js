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

    res.render( 'page/index', {
        pageName: 'index',
        images: list.map( function( item ){
            return util.formatUrl( route.DEVICE_SCREENSHOT, {name: item} );
        })
    });
});


router.get( route.DEVICE_SCREENSHOT, function( req, res, next ){
    var name = req.params.name,
        path = join( config.screenshotDir, name ),
        files = fs.readdirSync( path ),
        fileName = files.length && join( path, files[0] );

    if ( fileName ){
        res.type( mime.lookup(fileName) );
        res.set( 'Content-Disposition', 'filename="' + fileName + '"' );
        console.log( fileName );
        res.send( fs.readFileSync(fileName) );
    }
    else
        next( new httpError.NotFound );
});