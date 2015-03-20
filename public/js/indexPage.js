/**
 * @author Alexander Marenin
 * @date November 2014
 */

$( function(){
    var RELOAD_TIMEOUT = 20 * 60 * 1000,
        modal = $( '#device-modal' ),
        modalTitle = modal.find( '.modal-title' ),
        modalAnchor = modal.find( '#full-image' ),
        modalImage = modal.find( '#full-image > img' ),
        modalImageContainer = modal.find( '#image-container' ),
        modalComment = modal.find( '#modal-comment' ),
        modalSave = modal.find( '#save-comment' ),
        modalDelete = modal.find( '#delete-data' ),
        modalScreenshoot = modal.find( '#make-screenshot' ),
        modalStatus = modal.find( '#status-container' ),
        modalStatusOld = modalStatus.find( '#is-old' ),
        modalStatusProcessing = modalStatus.find( '#is-processing' ),
        modalStatusNoScreenShot = modalStatus.find( '#no-screenshot' ),
        modalStatusLastUpdate = modalStatus.find( '#last-update' ),
        blocks = $( 'div.block' ),
        data,
        block;

    setTimeout( reloadPage, RELOAD_TIMEOUT );

    blocks.click( function(){
        try {
            data = JSON.parse( $(this).attr('data-json') );
            fillModal( data );
            block = $( this );
        }
        catch( e ){
            console.error( 'Unable to parse json', data );
        }
    });


    modalSave.click( function(){
        var comment = modalComment.val();
        $.ajax({
            url: '/device/' + data.name,
            method: 'POST',
            data: {comment: comment}
        });
        modal.modal( 'hide' );
        data.comment = comment;
        block.attr( 'data-json', JSON.stringify(data) );
        block.find( '.so-well' ).html( comment );
    });


    modalDelete.click( function(){
        $.ajax({
            url: '/device/' + data.name,
            method: 'DELETE'
        }).then( function(){
            reloadPage();
        });
    });


    modalScreenshoot.click( function(){
        $.ajax({
            url: '/device/' + data.name + '/shoot',
            method: 'GET'
        }).then( function(){
            reloadPage();
        });
    });


    function fillModal( data ){
        modalTitle.html( data.name );
        if ( data.haveScreenshot ){
            modalImage.attr( 'src', data.url );
            modalImageContainer.show();
        }
        else
            modalImageContainer.hide();

        modalAnchor.attr( 'href', data.url );
        modalComment.val( data.comment || '' );
        modalStatus.find( '.label' ).hide();
        modalStatusLastUpdate.text( 'last update ' + data.elapsed + ' ago' ).show();

        if ( data.isProcessing )
            modalStatusProcessing.show();
        if ( !data.haveScreenshot )
            modalStatusNoScreenShot.show();
        if ( data.isOld )
            modalStatusOld.show();
    }

    function reloadPage(){
        window.location.reload();
    }
});