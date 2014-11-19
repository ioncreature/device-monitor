/**
 * @author Alexander Marenin
 * @date November 2014
 */

$( function(){
    var modal = $( '#device-modal' ),
        modalTitle = modal.find( '.modal-title' ),
        modalImage = modal.find( 'img' ),
        modalComment = modal.find( '#modal-comment' ),
        modalSave = modal.find( '#save-comment' ),
        anchors = $( 'div.block > h4 > a' ),
        data,
        anchor;

    anchors.click( function(){
        try {
            data = JSON.parse( $(this).attr('data-json') );
            fillModal( data );
            anchor = $( this );
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
        anchor.attr( 'data-json', JSON.stringify(data) );
        anchor.parents( 'div.block' ).find( '.so-well' ).html( comment );
    });


    function fillModal( data ){
        console.log( data );

        modalTitle.text( data.name + ' (last update ' + data.elapsed + ' ago)' );
        modalImage.attr( 'src', data.url     );
        modalComment.val( data.comment || '' );
    }
});