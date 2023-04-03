define(["qlik", "jquery", "text!./style.css", "./js/props", "./js/main", "./js/leonardo"], function
    (qlik, $, cssContent, props, main, leonardo) {

    'use strict';
    if (!main) console.warn('within db-ext-qloudfiend: main object', main);
    if (!props) console.warn('within db-ext-qloudfiend: props object', props);
    if (!leonardo) console.warn('within db-ext-qloudfiend: leonardo object', leonardo);

    // Initializing global object "qlobal"
    var qlobal = {
        qext: null,
        title: 'Qloud Friend Extension',
        sheetInfo: {},
        appInfo: null,
        spaceInfo: null,
        ownerInfo: null,
        userInfo: null,
        itemInfo: null,
        childApps: [],
        showFriend: false
    };

    const texts = {
        btnHoverTextFriend: 'click to open data/\\bridge qlikcloud actions.',
        btnHoverTextReload: 'Trigger a reload in the background for this app.',
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

                html = `
                    <div id="parent_${ownId}">
                        <button class="qfr-db-button-on-sheet  lui-button" title="${texts.btnHoverTextFriend}" 
                            style="display:none;">
                            <img id="dblogo_${ownId}" src="../extensions/db-ext-qloudfriend/pics/db-logo.png">
                        </button>
                        <button id="reload_${ownId}" class="lui-button qfr-${layout.pUseReloadBtn}" 
                            title="${texts.btnHoverTextReload}">
                            Reload
                        </button>
                    </div>`;

                $element.html(html);

                if (!qlobal.appInfo) {
                    main.apiCtrl.getQlobalInfo(qlobal);
                }

                qlobal.showFriend = !qlobal.spaceInfo
                    || !(layout.pHideInManagedApps && qlobal.spaceInfo.type == 'managed')
                    || !layout.pHideInManagedApps
                if (qlobal.showFriend) $(`#parent_${ownId} .qfr-db-button-on-sheet`).show();

                // const createdButton1stTime = $('.qfr-toolbar-button').length == 0;
                const createdButton1stTime = !main.apiCtrl.isSessionInLocalStore(app.id);
                $('.qfr-toolbar-button').remove();

                if (qlobal.showFriend) {
                    const sel = '[data-testid="qs-sub-toolbar__right"]';
                    const classes = $(`${sel} button:last`).attr('class'); // get the classes of the existing button in DOM
                    $(sel).append(`<button class="${classes} qfr-toolbar-button" 
                        title="${texts.btnHoverTextFriend}" ${createdButton1stTime ? 'style="width:0px;"' : ''}> 
                        <span class="databridge_logo"></span>
                    </button>`);
                    $('.qfr-toolbar-button, .qfr-db-button-on-sheet').click(function () {
                        main.open(layout, qlobal);
                    })


                    if (createdButton1stTime) {


                        // animate that the button is created on top panel
                        animateIcon(ownId);
                        main.apiCtrl.rememberSessionInLocalStore(app.id);

                        // show warning about sheets that are published but shouldn't or 
                        // that are private and shoud be public
                        main.functions.getObjectSheetList(layout, qlobal).then(res => {
                            if (res) {
                                var sheetsWrong = main.functions.getWrongSheetsCount(qlobal);
                                if (sheetsWrong > 0) {
                                    setTimeout(() => {
                                        leonardo.msg('qfr-main', null,
                                            `<div style="margin-right:22px;text-align:right"> 
                                                <span class="lui-icon  lui-icon--warning-triangle"></span>
                                                ${sheetsWrong} sheet${sheetsWrong > 1 ? 's are' : ' is'} not in 
                                                desired publish-state. Check here!
                                            </div>
                                            <img src="../extensions/db-ext-qloudfriend/pics/up-arrows.gif" 
                                                style="width:36px;position:absolute;top:0;right:0;" />`,
                                            null, 'Close', null, null, 'right:0;top:0;left:unset;width:140px;');
                                    }, 1500);
                                };
                            }
                        });
                    }
                }

                $("#reload_" + ownId).on("click", function () {
                    main.apiCtrl.reloadApp(ownId, app, qlobal);
                });

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
