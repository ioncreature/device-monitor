/**
 * @author Alexander Marenin
 * @date November 2014
 */

$( function(){
    var modal = $( '#device-modal' ),
        modalTitle = modal.find( '.modal-title' ),
        modalAnchor = modal.find( '#full-image' ),
        modalImage = modal.find( '#full-image > img' ),
        modalComment = modal.find( '#modal-comment' ),
        modalSave = modal.find( '#save-comment' ),
        modalDelete = modal.find( '#delete-data' ),
        blocks = $( 'div.block' ),
        data,
        block;

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
            window.location.reload();
        });
    });


    function fillModal( data ){
        modalTitle.text( data.name + ' (last update ' + data.elapsed + ' ago)' );
        modalImage.attr( 'src', data.url );
        modalAnchor.attr( 'href', data.url );
        modalComment.val( data.comment || '' );
    }
});