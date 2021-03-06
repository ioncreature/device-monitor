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
    this.loopInterval = options.loopInterval;
    this.timeout = options.timeout;
    this.errors = [];
    this.processing = {};
}


ScreenShooter.prototype.makeForSimplates = function( names, callback ){
    var cmd = 'python ' + this.screenshoterPath + ' --type simplate --cmd --X --scp';
    if ( arguments.length === 2 )
        cmd += ' --devs ' + names;
    else
        callback = names;
    this.exec( cmd, callback );
};


ScreenShooter.prototype.makeForPrinters = function( names, callback ){
    var cmd = 'python ' + this.screenshoterPath + ' --type printer --cmd --scp';
    if ( arguments.length === 2 )
        cmd += ' --devs ' + names;
    else
        callback = names;
    this.exec( cmd, callback );
};


ScreenShooter.prototype.makeForDevice = function( name, callback ){
    var self = this;

    if ( isNameLooksLikePrinter(name) )
        this.makeForPrinters( name, handler );
    else
        this.makeForSimplates( name, handler );

    self.processing[name] = true;

    function handler( error ){
        self.processing[name] = false;
        callback( error );
    }
};


ScreenShooter.prototype.exec = function( cmd, callback ){
    var ss = this;
    exec( cmd, {timeout: this.timeout}, function( error, stdout, stderr ){
        if ( error )
            ss.addError( error );
        fs.writeFileSync( ss.stdoutPath, stdout );
        fs.writeFileSync( ss.stderrPath, stderr );
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
    var ss = this,
        delay = interval || this.loopInterval;

    this.stopLoop();
    this.loopTimer = setTimeout( function(){
        ss.collect();
        ss.startLoop( delay );
    }, delay );
    this.nextIteration = Date.now() + delay;
};


ScreenShooter.prototype.stopLoop = function(){
    this.loopTimer && clearTimeout( this.loopTimer );
    delete this.loopTimer;
    delete this.nextIteration;
};


ScreenShooter.prototype.restartLoop = function(){
    this.startLoop();
};


ScreenShooter.prototype.loopStarted = function(){
    return this.loopTimer && this.nextIteration;
};


ScreenShooter.prototype.whenNextLoop = function(){
    return this.nextIteration;
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
        ss.finish = Date.now();
        callback && callback( error );
    });
    return true;
};


ScreenShooter.prototype.isRunning = function( name ){
    if ( name )
        return !!this.processing[name];
    else
        return this.running;
};


function isNameLooksLikePrinter( name ){
    return name.indexOf( 'prn' ) > -1;
}