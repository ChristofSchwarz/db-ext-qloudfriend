// functions needed in DevelopersFriend.js ...

define([], function () {

    //=============================================================================================
    function leonardoMsg(ownId, title, detail, ok, cancel, stayOpen, inverse) {
        //=========================================================================================
        // This html was found on https://qlik-oss.github.io/leonardo-ui/dialog.html
        if ($('#msgparent_' + ownId).length > 0) $('#msgparent_' + ownId).remove();

        var html = '<div id="msgparent_' + ownId + '">' +
            '  <div class="lui-modal-background"></div>' +
            '  <div class="lui-dialog' + (inverse ? '  lui-dialog--inverse' : '') + '" style="width: 400px;top:80px;">' +
            '    <div class="lui-dialog__header">' +
            '      <div class="lui-dialog__title">' + title + '</div>' +
            '    </div>' +
            '    <div class="lui-dialog__body">' +
            detail +
            '    </div>' +
            '    <div class="lui-dialog__footer">';
        if (cancel) {
            html +=
                '  <button class="lui-button  lui-dialog__button' + (inverse ? '  lui-button--inverse' : '') + '" id="msgcancel_' + ownId + '"' +
                (!stayOpen ? ' onclick="$(\'#msgparent_' + ownId + '\').remove();"' : '') + '>' +
                //'   onclick="var elem=document.getElementById(\'msgparent_' + ownId + '\');elem.parentNode.removeChild(elem);">' +
                cancel +
                ' </button>'
        }
        if (ok) {
            html +=
                '  <button class="lui-button  lui-dialog__button  ' + (inverse ? '  lui-button--inverse' : '') + '" id="msgok_' + ownId + '">' +
                ok +
                ' </button>'
        };
        html +=
            '     </div>' +
            '  </div>' +
            '</div>';

        if ($("#qs-page-container").length > 0) {
            $("#qs-page-container").append(html);  // one of the two css selectors will work
        } else {
            $("#qv-stage-container").append(html);  // above in Sense Client, below in /single mode
        }
        // fix for Qlik Sense > July 2021, the dialog gets rendered below the visible part of the screen
        if ($('#msgparent_' + ownId + ' .lui-dialog').position().top > 81) {
            $('#msgparent_' + ownId + ' .lui-dialog').css({
                'top': (-$('#msgparent_' + ownId + ' .lui-dialog').position().top + 100) + 'px'
            });
        }
    }


    //=============================================================================================
    async function doAjax(method, url, ownId, httpHeader, body) {
        //=========================================================================================

        let result;
        try {
            // if the url doesn't contain querystring "xrfkey" add it.
            if (url.indexOf('xrfkey') == -1) {
                url += (url.indexOf('?') == -1 ? '?xrfkey=' : '&xrfkey=') + Math.random().toString().substr(2).repeat(8).substr(0, 16);
            }
            var args = {
                timeout: 0,
                method: method,
                url: url,
                headers: httpHeader
            };
            if (body) args.data = body;
            // set querystring xrfkey also as http-request-header X-Qlik-Xrfkey
            args.headers["X-Qlik-Xrfkey"] = url.split('xrfkey=')[1].substr(0, 16);
            // if method isn't GET then set Content-Type in http-request-header 
            if (method.toUpperCase() != 'GET') args.headers["Content-Type"] = 'application/json';
            console.log('$.ajax request', args);
            result = await $.ajax(args);
            console.log('$.ajax response', result);
            return result || ''; // return empty string instead of undefined
        } catch (error) {
            leonardoMsg(ownId, 'Error', error.status + ' ' + error.responseText, null, 'Close', false, true);
            console.log('error', error.status + ' ' + error.responseText);
            return ({ "error": true, "info": error });
        }
    }

    return {

        // nice messagebox using Leonardo UI style by Qlik 	
        leonardoMsg: function (ownId, title, detail, ok, cancel, stayopen, inverse) {
            leonardoMsg(ownId, title, detail, ok, cancel, stayopen, inverse);
        },


    };
});
