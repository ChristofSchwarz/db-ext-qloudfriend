define(["qlik", "jquery", "text!./style.css", "./props", "./leonardo",
    "./buttons/1", "./buttons/2", "text!./pics/db-logo.png"], function
    (qlik, $, cssContent, props, leonardo, button1, button2, dblogo) {

    'use strict';

    var qlobal = {
        qext: null,
        title: 'Qloud Friend Extension',
        sheetInfo: {}
    };

    const texts = {
        btnHoverText: 'click to open data/\\bridge qlikcloud actions.',
        btnHoverText1: 'Trigger a reload in the background for this app.',
    }

    if (!qlobal.qext) $.ajax({
        url: '../extensions/db-ext-qloudfriend/db-ext-qloudfriend.qext',
        dataType: 'json',
        async: false,  // wait for this call to finish.
        success: function (data) {
            qlobal.qext = data;
            qlobal.title += ' <span class="qfr-version">v' + data.version + '</span>';
        }
    });


    $("<style>").html(cssContent).appendTo("head");

    return {
        initialProperties: {
            showTitles: true,
            title: "",
            subtitle: "",
            footnote: {
                qStringExpression: { qExpr: "'Reloaded ' & ReloadTime()" }
            },
            disableNavMenu: true,
        },

        definition: {
            type: "items",
            component: "accordion",
            items: props.items(qlobal.qext)
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
            var mode = qlik.navigation.getMode();
            const currSheet = qlik.navigation.getCurrentSheetId().sheetId;

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
                    <button class="qfr-db-button-on-sheet  lui-button" title="${texts.btnHoverText}">
                        <img id="dblogo_${ownId}" src="../extensions/db-ext-qloudfriend/pics/db-logo.png"></span>
                    </button>
                    <button id="btn1_${ownId}" class="lui-button qloudFriend-${layout.pUseBtn1}" title="${texts.btnHoverText1}">
                        ${layout.pBtnLabel1}
                    </button>
                    <!--
                    <button id="btn2_publish_${ownId}" class="lui-button qloudFriend-${layout.pUseBtn2}" style="display:none;">
                        ${layout.pBtnLabel2_publish}
                    </button>
                    <button id="btn2_unpublish_${ownId}" class="lui-button qloudFriend-${layout.pUseBtn2}" style="display:none;">
                        ${layout.pBtnLabel2_unpublish}
                    </button> 
                    <button id="btn3_${ownId}" class="lui-button qloudFriend-${layout.pUseBtn3}">
                        ${layout.pBtnLabel3}
                    </button>
                    -->
                </div>`;

                $element.html(html);


                // button2.getSheetStatus(ownId, layout, qlobal);
                const createdButton1stTime = $('.qloudFriend-toolbar-button').length == 0;
                $('.qloudFriend-toolbar-button').remove();
                const sel = '[data-testid="qs-sub-toolbar__right"]';
                const classes = $(`${sel} button:last`).attr('class'); // get the classes of the existing button in DOM
                $(sel).append(`<button class="${classes} qloudFriend-toolbar-button" 
                        title="${texts.btnHoverText}" ${createdButton1stTime ? 'style="width:0px;"' : ''}> 
                        <span class="databridge_logo"></span>
                    </button>`);
                $('.qloudFriend-toolbar-button, .qfr-db-button-on-sheet').click(function () {
                    button2.toolbarButton(ownId, layout, qlobal);
                })

                // animate that the button is created on top panel
                if (createdButton1stTime) {
                    setTimeout(function () {
                        const pos1 = $(`#dblogo_${ownId}`).offset();
                        const pos2 = $(`.qloudFriend-toolbar-button`).offset();
                        console.log(pos1, pos2);
                        var btn_copy = $(`#dblogo_${ownId}`).clone()
                            .prop('id', `dblogo2_${ownId}`)
                            .css({
                                position: 'absolute',
                                "z-index": 12345,
                                width: '23px',
                                top: pos1.top,
                                left: pos1.left
                            });
                        $('#qv-page-container').append(btn_copy);
                        btn_copy.animate(pos2, 1000, 'swing', () => {
                            $('.qloudFriend-toolbar-button').animate({ width: '42px' }, 500, 'swing', () => {
                                btn_copy.remove();
                            });
                        });
                    }, 300);
                }

                $("#btn1_" + ownId).on("click", function () { button1.click(ownId, app); });
                // $("#btn99_" + ownId).on("click", function () { console.log(qlobal) });

                $("#btn2_publish_" + ownId).on("click", function () { button2.publish() });
                $("#btn2_unpublish_" + ownId).on("click", function () { button2.unpublish() });
                // $("#btn2_edit_" + ownId).on("click", function () { qlik.navigation.setMode('edit') });
                // $("#btn2_analyse_" + ownId).on("click", function () { qlik.navigation.setMode('analysis') });
                // $("#btn3_" + ownId).on("click", function () { button3.click(ownId, layout); });
                // updating the elements without repainting entire extension html
                $('#button_parent_' + ownId + ' button').css('width', 'calc(' + layout.pBtnWidth2 + "% - 2px)");
            }
            return qlik.Promise.resolve();
        }
    };
});