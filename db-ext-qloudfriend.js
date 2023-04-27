define(["qlik", "jquery", "text!./style.css", "./js/props", "./js/main",
    "./js/leonardo", "text!./texts.json"], function
    (qlik, $, cssContent, props, main, leonardo, texts) {

    'use strict';
    // if (!main) console.warn('within db-ext-qloudfiend: main object', main);
    // if (!props) console.warn('within db-ext-qloudfiend: props object', props);
    // if (!leonardo) console.warn('within db-ext-qloudfiend: leonardo object', leonardo);

    // Initializing global object "qlobal"
    var qlobal = {
        qext: null,
        title: `Qloud Friend Extension <span class="qfr-version">v{{version}}</span>`,
        sheetInfo: {},
        appInfo: null,
        spaceInfo: null,
        ownerInfo: null,
        userInfo: null,
        itemInfo: null,
        childApps: [], // list of (managed) apps that the current app is a parent of
        showFriend: false,
        setInterval: false,
        setIntervalFor: [],
        ongoingReload: null, // object of the ongoing reload (if any) with {id: ..., status: ...}
        // reloadHistory: [],
        resetAfter: 0,
        texts: JSON.parse(texts)
    }

    if (!qlobal.qext) $.ajax({
        url: '../extensions/db-ext-qloudfriend/db-ext-qloudfriend.qext',
        dataType: 'json',
        async: false,  // wait for this call to finish.
        success: function (data) {
            qlobal.qext = data;
            qlobal.title = qlobal.title.replace('{{version}}', data.version);
        }
    });


    $("<style>").html(cssContent).appendTo("head");

    return {
        initialProperties: props.initialProperties(),

        definition: {
            type: "items",
            component: "accordion",
            items: props.items(qlobal.qext)
        },

        resize: function ($element, layout) {
            //     // nothing to do when only resized
            return qlik.Promise.resolve();
        },

        paint: function ($element, layout) {

            // var self = this;
            const ownId = layout.qInfo.qId;
            // console.log('QloudFriend ' + ownId + ' paint method.');
            // console.log('layout:', layout);
            // console.log('qlobal ongoingReload', JSON.stringify(qlobal.ongoingReload));

            var app = qlik.currApp();
            var mode = qlik.navigation.getMode();
            //console.log('paint qloudfriend mode ', mode);
            const currSheet = qlik.navigation.getCurrentSheetId().sheetId;

            var html = '';

            if (location.href.indexOf('qlikcloud.com') == -1) {
                html = '<p>This extension only works on qlikcloud.com</p>';
                $element.html(html);

            } else {

                const bgColor1 = layout.pBgColor1 == undefined ? '#fefefe' : (layout.pBgColor1.color || layout.pBgColor1);
                const txtColor1 = layout.pTxtColor1 == undefined ? '#222222' : (layout.pTxtColor1.color || layout.pTxtColor1);

                html = `
                    <div id="parent_${ownId}" style="text-align:${layout.pAlign || 'left'};">
                        <span class="qfr-wait  lui-icon  lui-icon--large  lui-icon--sync"></span>
                        <button class="qfr-db-button-on-sheet  lui-button" 
                            title="${qlobal.texts.btnHoverTextFriend}" 
                            style="display:none;">
                            <img id="dblogo_${ownId}" src="../extensions/db-ext-qloudfriend/pics/db-logo.png">
                        </button>
                        <button id="reload_${ownId}" 
                            class="lui-button  qfr-reload-btn" 
                            style="display:none;" 
                            title="${qlobal.texts.reloadMsg.ready}" data-mode="ready">
                            ${layout.pLabelReloadBtn}
                        </button>
                        <a href style="display:none;" class="qfr-reloadhistory" target="_blank" title="${qlobal.texts.btnInfoHover}">
                            <span class="lui-icon  lui-icon--small  lui-icon--info" ></span>
                        </a>
                    </div>`;

                // render html if first time paint
                if ($(`#parent_${ownId}`).length == 0) {
                    $element.html(html);
                    // register click event of Reload button
                    $("#reload_" + ownId).click(function () {
                        main.apiCtrl.reloadApp(ownId, app, qlobal);
                        main.other.updateButtonStatus(ownId, "QUEUED", qlobal, layout);
                    });
                } else {
                    $(`#parent_${ownId}`).css('text-align', layout.pAlign || 'left')
                }

                // make some Cloud API calls to find out all about this app, store into qlobal object
                if (!qlobal.appInfo) {
                    main.apiCtrl.getQlobalInfo(qlobal, ownId, layout);
                }
                // if there is itemInfo in qlobal put href into the link element (i) and show it
                if (qlobal.itemInfo) {
                    $(`#parent_${ownId} .qfr-reloadhistory`).show()
                        .attr('href', `/item/${qlobal.itemInfo.id}/history`);
                }

                $(`#parent_${ownId} .qfr-wait`).hide();

                // update visibilty of Reload button
                if (layout.pUseReloadBtn) {
                    if (qlobal.ongoingReload) {
                        main.other.updateButtonStatus(ownId, qlobal.ongoingReload.status, qlobal, layout);
                    }
                    $(`#reload_${ownId}`).show().css({ "background-color": bgColor1, color: txtColor1 });
                } else {
                    $(`#reload_${ownId}`).hide();
                }

                qlobal.showFriend = !qlobal.spaceInfo
                    || !(layout.pHideInManagedApps && qlobal.spaceInfo.type == 'managed')
                    || !layout.pHideInManagedApps
                if (qlobal.showFriend) $(`#parent_${ownId} .qfr-db-button-on-sheet`).show();

                // const createdButton1stTime = $('.qfr-toolbar-button').length == 0;
                const createdButton1stTime = !main.apiCtrl.isSessionInLocalStore(app.id);
                $('.qfr-toolbar-button').remove();

                if (qlobal.showFriend) {
                    if ($('.qfr-toolbar-button').length == 0) {
                        const sel = '[data-testid="qs-sub-toolbar__right"]';
                        const classes = $(`${sel} button:last`).attr('class'); // get the classes of the existing button in DOM
                        $(sel).append(`<button class="${classes} qfr-toolbar-button" 
                            title="${qlobal.texts.btnHoverTextFriend}" 
                            style="${createdButton1stTime ? 'width:0;' : ''}"> 
                            <span class="databridge_logo"></span>
                        </button>`);
                        $('.qfr-toolbar-button, .qfr-db-button-on-sheet').click(function () {
                            console.log('qloudfriend layout:', layout);
                            console.log('qloudfriend qlobal:', qlobal);
                            main.open(layout, qlobal);
                        })

                        if (createdButton1stTime) {
                            // animate that the button is created on top panel
                            animateIcon(ownId);
                            main.apiCtrl.rememberSessionInLocalStore(app.id);
                        }
                    }
                    // get qlobal.sheetInfo updated 
                    main.functions.getObjectSheetList(layout, qlobal).then(res => {
                        if (res) {
                            var sheetsWrong = main.functions.getWrongSheetsCount(qlobal);
                            if (sheetsWrong == 0) {
                                $(`.qfr-toolbar-button`).css('background-color', '').prop('title', qlobal.texts.btnHoverTextFriend);
                            } else {
                                const info = `${sheetsWrong} ${sheetsWrong > 1 ? qlobal.texts.infoWrongStateMany : qlobal.texts.infoWrongStateOne}`;
                                $(`.qfr-toolbar-button`).css('background-color', 'rgb(203,91,91)').prop('title', info);
                                if (createdButton1stTime) {
                                    // show warning about sheets that are published but shouldn't or 
                                    // that are private and shoud be public
                                    setTimeout(() => {
                                        leonardo.msg('qfr-main', null,
                                            `<div class="qfr-firsttime-warning"> 
                                            <span class="lui-icon  lui-icon--warning-triangle"></span>
                                            ${info}
                                        </div>
                                        <img src="../extensions/db-ext-qloudfriend/pics/up-arrows.gif" 
                                            style="width:36px;position:absolute;top:0;right:0;" />`,
                                            null, 'Close', null, null, 'right:0;top:0;left:unset;width:140px;');
                                    }, 1500);
                                }
                            }
                        }
                    });
                } else {
                    $('.qfr-toolbar-button').remove();
                }
                // Try to hide the background with css manipulation

                if (layout.pHideBackground) {
                    $(`#parent_${ownId}`).closest('article').css('border', 'unset');
                    $(`#parent_${ownId}`).closest('.qv-inner-object').css({ background: 'unset', padding: 'unset' });
                } else {
                    $(`#parent_${ownId}`).closest('article').css('border', '');
                    $(`#parent_${ownId}`).closest('.qv-inner-object').css({ background: '', padding: '' });
                }

                // register interval
                if (qlobal.setIntervalFor.length == 0) {
                    // the first interval to register
                    qlobal.setIntervalFor.push(ownId);
                    setInterval(() => {
                        qlobal.setIntervalFor.forEach((objectId) => {
                            if ($(`#parent_${objectId}`).length) main.intervalHandler(objectId, layout, qlobal)
                        })
                    }, 5000);
                } else if (qlobal.setIntervalFor.indexOf(ownId) == -1) {
                    qlobal.setIntervalFor.push(ownId)
                }
            }

            return qlik.Promise.resolve();
        }
    };

    function animateIcon(ownId) {
        setTimeout(function () {
            const pos1 = $(`#dblogo_${ownId}`).offset();
            const pos2 = $(`.qfr-toolbar-button`).offset();
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
                $('.qfr-toolbar-button').animate({ width: '42px' }, 500, 'swing', () => {
                    btn_copy.remove();
                });
            });
        }, 300);
    }
});
