/**
 * @author Alexander Marenin
 * @date November 2014
 */

var exec = require( 'child_process' ).exec,
    async = require( 'async' ),
    fs = require( 'fs' );

module.exports = ScreenShoter;


/**
 * @param {{stdoutPath, stderrPath, screenshoterPath, outDir}} options
 * @constructor
 */
function ScreenShoter( options ){
    this.stdoutPath = options.stdoutPath;
    this.stderrPath = options.stderrPath;
    this.screenshoterPath = options.screenshoterPath;
    this.outDir = options.outDir;
    this.errors = [];
}


ScreenShoter.prototype.makeForSimplates = function( callback ){
    var cmd = 'python ' + this.screenshoterPath + ' --type simplate --cmd --x --scp --out ' + this.outDir;
    this.exec( cmd, callback );
};


ScreenShoter.prototype.makeForPrinters = function( callback ){
    var cmd = 'python ' + this.screenshoterPath + ' --type printer --cmd --scp --out ' + this.outDir;
    this.exec( cmd, callback );
};


ScreenShoter.prototype.exec = function( cmd, callback ){
    var ss = this;
    exec( cmd, function( error, stdout, stderr ){
        if ( error )
            ss.addError( error );
        fs.appendFileSync( ss.stdoutPath, stdout );
        fs.appendFileSync( ss.stderrPath, stderr );
        callback();
    });
};


ScreenShoter.prototype.addError = function( error ){
    this.errors.push({
        msg: error,
        stack: error.stack,
        date: new Date
    });
};


ScreenShoter.prototype.startLoop = function( interval ){
    var ss = this;

    if ( ss.running )
        return false;

    ss.timer = setInterval( function(){
        ss.running = true;
        ss.start = Date.now();
        async.parallel([
            function( cb ){
                ss.makeForSimplates( cb );
            },
            function( cb ){
                ss.makeForPrinters( cb );
            }
        ], function(){
            ss.running = false;
            ss.stop = Date.now();
        });
    }, interval );
};


ScreenShoter.prototype.isRunning = function(){
    return this.running;
};

