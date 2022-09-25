// nice messagebox using Leonardo UI style by Qlik 	

define(["jquery"], function ($) {

    return {

        msg: function (ownId, title, detail, ok, cancel, stayOpen = false, inverse = false) {
            //=========================================================================================
            // This html was found on https://qlik-oss.github.io/leonardo-ui/dialog.html

            if ($('#msgparent_' + ownId).length > 0) $('#msgparent_' + ownId).remove();

            var html =
                `<div id="msgparent_${ownId}">
                    <div class="lui-modal-background"></div>
                    <div class="lui-dialog  ${inverse ? 'lui-dialog--inverse' : ''}  qloudFriend-dialog">
                        <div class="lui-dialog__header">
                            <div class="lui-dialog__title">${title}</div>
                        </div>
                        <div class="lui-dialog__body">
                            ${detail}
                        </div>
                        <div class="lui-dialog__footer">
                            <!-- buttons will be inserted here -->
                        </div>
                    </div>
                </div>`;

            if ($("#qs-page-container").length > 0) {
                $("#qs-page-container").append(html);  // one of the two css selectors will work
            } else {
                $("#qv-stage-container").append(html);  // above in Sense Client, below in /single mode
            }

            if (cancel) {
                $(`#msgparent_${ownId} .lui-dialog__footer`).append(
                    `<button class="lui-button  lui-dialog__button  ${inverse ? 'lui-button--inverse' : ''}" 
                        id="msgcancel_${ownId}">${cancel}</button>`
                );
                if (!stayOpen) {
                    $(`#msgcancel_${ownId}`).click(function () {
                        $(`#msgparent_${ownId}`).remove();
                    })
                }
            }
            if (ok) {
                $(`#msgparent_${ownId} .lui-dialog__footer`).append(
                    `<button class="lui-button  lui-dialog__button  ${inverse ? 'lui-button--inverse' : ''}" 
                        id="msgcancel_${ownId}">${ok}</button>`
                )
            };

        }

    };

});
