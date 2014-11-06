/**
 * @author Alexander Marenin
 * @date November 2014
 */

var exec = require( 'child_process' ).exec,
    async = require( 'async' ),
    fs = require( 'fs' );

module.exports = ScreenShooter;


/**
 * @param {{stdoutPath, stderrPath, screenshoterPath, outDir}} options
 * @constructor
 */
function ScreenShooter( options ){
    this.stdoutPath = options.stdoutPath;
    this.stderrPath = options.stderrPath;
    this.screenshoterPath = options.screenshoterPath;
    this.errors = [];
}


ScreenShooter.prototype.makeForSimplates = function( callback ){
    var cmd = 'python ' + this.screenshoterPath + ' --type simplate --cmd --X --scp';
    this.exec( cmd, callback );
};


ScreenShooter.prototype.makeForPrinters = function( callback ){
    var cmd = 'python ' + this.screenshoterPath + ' --type printer --cmd --scp';
    this.exec( cmd, callback );
};


ScreenShooter.prototype.exec = function( cmd, callback ){
    var ss = this;
    exec( cmd, function( error, stdout, stderr ){
        if ( error )
            ss.addError( error );
        console.log( error );
        fs.appendFileSync( ss.stdoutPath, stdout );
        fs.appendFileSync( ss.stderrPath, stderr );
        callback( error );
    });
};


ScreenShooter.prototype.addError = function( error ){
    this.errors.push({
        msg: error,
        stack: error.stack,
        date: new Date
    });
};


ScreenShooter.prototype.startLoop = function( interval ){
    var ss = this;

    if ( ss.running )
        return false;

    ss.timer = setInterval( function(){
        ss.collect();
    }, interval );
};


ScreenShooter.prototype.collect = function( callback ){
    var ss = this;

    if ( ss.running )
        return false;

    ss.running = true;
    ss.start = Date.now();
    async.parallel([
        function( cb ){
            ss.makeForSimplates( cb );
        },
        function( cb ){
            ss.makeForPrinters( cb );
        }
    ], function( error ){
        ss.running = false;
        ss.stop = Date.now();
        callback( error );
    });
};



ScreenShooter.prototype.isRunning = function(){
    return this.running;
};
