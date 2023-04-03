// nice messagebox using Leonardo UI style by Qlik 	

define(["jquery"], function ($) {

    return {

        msg: function (ownId, title, detail, ok, cancel, stayOpen = false, inverse = false, styles = null) {
            //=========================================================================================
            // This html was found on https://qlik-oss.github.io/leonardo-ui/dialog.html

            if ($('#msg_parent_' + ownId).length > 0) $('#msg_parent_' + ownId).remove();

            var html =
                `<div id="msg_parent_${ownId}">
                    <div class="lui-modal-background"></div>
                    <div class="lui-dialog  ${inverse ? 'lui-dialog--inverse' : ''}  qfr-dialog" 
                        ${styles ? ('style="' + styles + '"') : ''}>
                        <div class="lui-dialog__header" ${title ? '' : 'style="display:none;"'}>
                            <div class="lui-dialog__title">
                                <span>${title}</span>
                                <a href="https://www.databridge.ch" target="_blank">
                                    <img src="../extensions/db-ext-qloudfriend/pics/${inverse ? 'db_logo_dark.gif' : 'db_logo_white-small.gif'}" class="qfr-databridge-title-img">
                                </a>
                            </div>
                        </div>
                        <div class="lui-dialog__body" ${detail ? '' : 'style="display:none;"'}>
                            ${detail}
                        </div>
                        <div class="lui-dialog__footer" style="height:unset;">
                        </div>
                    </div>
                </div>`;

            if ($("#qs-page-container").length > 0) {
                $("#qs-page-container").append(html);  // one of the two css selectors will work
            } else {
                $("#qv-stage-container").append(html);  // above in Sense Client, below in /single mode
            }

            if (cancel) {
                $(`#msg_parent_${ownId} .lui-dialog__footer`).append(
                    `<button class="lui-button  lui-dialog__button  ${inverse ? 'lui-button--inverse' : ''}" 
                        id="msg_cancel_${ownId}">${cancel}</button>`
                );
                if (!stayOpen) {
                    $(`#msg_cancel_${ownId}`).click(function () {
                        $(`#msg_parent_${ownId}`).remove();
                    })
                }
            }
            if (ok) {
                $(`#msg_parent_${ownId} .lui-dialog__footer`).append(
                    `<button class="lui-button  lui-dialog__button  ${inverse ? 'lui-button--inverse' : ''}" 
                        id="msg_ok_${ownId}">${ok}</button>`
                )
            };

        }

    };

});
