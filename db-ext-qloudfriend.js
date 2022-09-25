define(["qlik", "jquery", "text!./style.css", "./props", "./buttons/1"], function
    (qlik, $, cssContent, props, button1) {
    const hideAd = true;  // show or hide the "by data/\bridge" text 

    'use strict';

    var qext;

    if (!qext) $.ajax({
        url: '../extensions/db-ext-qloudfriend/db-ext-qloudfriend.qext',
        dataType: 'json',
        async: false,  // wait for this call to finish.
        success: function (data) { qext = data; }
    });


    $("<style>").html(cssContent).appendTo("head");

    return {
        initialProperties: {
            showTitles: false,
            disableNavMenu: true
        },

        definition: {
            type: "items",
            component: "accordion",
            items: props.items(qext)
        },

        // resize: function ($element, layout) {
        //     // nothing to do when only resized
        //     return qlik.Promise.resolve();
        // },

        paint: function ($element, layout) {

            var self = this;
            const ownId = layout.qInfo.qId;
            console.log('QloudFriend ' + ownId + ' paint method. layout:', layout);
            var app = qlik.currApp();

            var html = '';

            if (location.href.indexOf('qlikcloud.com') == -1) {
                html = '<p>This extension only works on qlikcloud.com</p>';
                $element.html(html);

            } else {

                // turn off (white) bg color of this object
                // $('[tid="' + ownId + '"] .qv-inner-object').css('background-color', layout.pNoBkgr ? 'rgba(0,0,0,0)' : '');
                // $('[tid="' + ownId + '"] .qv-object').css('border-color', layout.pNoBkgr ? 'rgba(0,0,0,0)' : '');
                // if (layout.pNoBkgr) {
                //     $('[tid="' + ownId + '"] header').hide();
                // }


                html = `<div id="parent_${ownId}">
                    <button id="btn1_${ownId}" class="lui-button qloudFriend-${layout.pUseBtn1}">${layout.pBtnLabel1}</button>
                </div>`;

                $element.html(html);

                $("#btn1_" + ownId).on("click", function () {
                    button1.click(ownId, app.id);
                    $.ajax({
                        url: '/api/v1/items?resourceType=app&limit=100',
                        dataType: 'json',
                        method: 'GET',
                        // contentType: "application/json",
                        headers: {
                            // "Authorization": "Bearer " + layout.pApiKey
                        },
                        // data: { appId: appId },
                        async: false,  // wait for this call to finish.
                        success: function (data) {
                            console.log(data)
                        }
                    })
                });

                // updating the elements without repainting entire extension html
                $('#button_parent_' + ownId + ' button').css('width', 'calc(' + layout.pBtnWidth2 + "% - 2px)");
            }
            return qlik.Promise.resolve();
        }
    };
});