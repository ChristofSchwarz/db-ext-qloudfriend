// Button 1 Click Handler

define(["qlik", "jquery", "../leonardo", "../functions"], function
    (qlik, $, leonardo, functions) {

    const markSelector = '.sheet-title-container';
    // const markSelector = '[tid="qs-sub-toolbar"]';
    // const modSelector = '#sheet-title .sheet-title-text'
    const colors = {
        public: 'lightgreen',
        community: 'yellow',
        private: 'pink'
    }

    const close_button = `
        <button class="lui-button qfr-close-msg" style="float:right;padding: 0 5px;min-width: 20px;height: unset;">
            <span class="lui-icon  lui-icon--small  lui-icon--close"></span>
        </button>`;

    // const texts = {
    //     private: `<span class="lui-icon  lui-icon--warning-triangle"></span><span>&nbsp;This sheet is private.</span>`,
    //     published: '<span class="lui-icon  lui-icon--share"></span><span>&nbsp;This sheet is published</span>'
    // }

    const texts = {
        sourceData: 'Copy data from this app to child app',
        targetData: 'Do not change data of child app'
    }

    const dialogStyle = 'right:0;top:0;left:unset;width:480px;';

    function getSheetStatus(ownId, layout, qlobal) {
        return new Promise((resolve, reject) => {
            // const enigma = app.model.enigmaModel;
            const app = qlik.currApp();
            const currSheet = qlik.navigation.getCurrentSheetId().sheetId;
            var sheetInfo = {};
            // var suggestedAction = '?';

            app.getAppObjectList('sheet', function (reply) {

                for (const sheet of reply.qAppObjectList.qItems) {
                    console.log('sheet', sheet);
                    // $.each(reply.qAppObjectList.qItems, function (key, sheet) {
                    sheetInfo[sheet.qInfo.qId] = {
                        rank: sheet.qData.rank,
                        title: sheet.qMeta.title,
                        description: sheet.qData.description || sheet.qData.descriptionExpression,
                        ownerId: sheet.qMeta.ownerId,
                        published: sheet.qMeta.published,
                        approved: sheet.qMeta.approved,
                    };
                };

                const thisSheet = sheetInfo[currSheet];
                qlobal.sheetInfo = sheetInfo; // put sheetinfo to qlobal object

                // console.log('thisSheet', thisSheet);
                // $('.qloudFriend-hint').remove()
                if (thisSheet.published && thisSheet.approved) {
                    // $(markSelector).css('background-color', colors.public);
                    $(`#btn2_${ownId}`).text('Make private');
                    resolve({ action: '?', sheetInfo: thisSheet });
                }
                if (thisSheet.published && !thisSheet.approved) {
                    // $(markSelector).css('background-color', colors.community);
                    $(`#btn2_publish_${ownId}`).css('display', 'none');
                    $(`#btn2_unpublish_${ownId}`).css('display', '');
                    resolve({ action: 'unpublish', sheetInfo: thisSheet });
                }
                if (!thisSheet.published && !thisSheet.approved) {
                    // $(markSelector).css('background-color', colors.private);
                    $(`#btn2_publish_${ownId}`).css('display', '');
                    $(`#btn2_unpublish_${ownId}`).css('display', 'none');
                    resolve({ action: 'publish', sheetInfo: thisSheet });
                }

            });
        })
    }


    return {
        getSheetStatus: function (ownId, layout, qlobal) {
            return new Promise((resolve, reject) => {
                getSheetStatus(ownId, layout, qlobal).then(res => resolve(res));
            })
        },

        publish: async function () {
            await publish();
        },

        unpublish: async function () {
            await unpublish();
        },

        toolbarButton: async function (ownId, layout, qlobal) {

            console.log('db button clicked', qlobal);

            const app = qlik.currApp();
            const currSheet = qlik.navigation.getCurrentSheetId().sheetId;

            leonardo.msg('qloudFriend', qlobal.title,
                `<div class="qloudFriend-rotate">
                    <span class="lui-icon  lui-icon--reload"></span>
                </div>`,
                null, 'Cancel', null, null, dialogStyle
            );

            const res = await getSheetStatus(ownId, layout, qlobal);

            var sheetTable = `<div style="overflow-y:auto;max-height:240px;">
                <table class="qloudFriend-sheetTable">
                    <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th class="qfr-th-sort">Sheet</th>
                            <th class="qfr-th-sort">Tag</th>
                            <th class="qfr-th-sort">Published</th>
                            <th class="qfr-th-sort">Approved</th>
                        </tr>
                    </thead>
                    <tbody id="${ownId}-tbody">
                    </tbody>
                </table>
                </div>`;

            leonardo.msg('qloudFriend',
                //(res.sheetInfo.published ? texts.published : texts.private) + close_button,
                qlobal.title + close_button,
                // null, 
                `<div class="qfr-tablefilter">
                    <span class="lui-icon  lui-icon--filter"></span> Filter sheets
                    <label class="lui-checkbox">
                        <input type="checkbox" id="qfr-show-all" class="lui-checkbox__input" aria-label="Label" />
                        <div class="lui-checkbox__check-wrap">
                            <span class="lui-checkbox__check"></span>
                            <span class="lui-checkbox__check-text">all <span id="qfr-all-counter" class="qfr-counter-normal"></span></span>
                        </div>
                    </label>
                    &nbsp;
                    <label class="lui-checkbox">
                        <input type="checkbox" id="qfr-show-warnings" class="lui-checkbox__input" aria-label="Label" checked />
                        <div class="lui-checkbox__check-wrap">
                            <span class="lui-checkbox__check"></span>
                            <span class="lui-checkbox__check-text">warnings <span id="qfr-warnings-counter" class="qfr-counter-normal"></span></span>
                        </div>
                    </label>
                    &nbsp;
                    <label class="lui-checkbox">
                        <input type="checkbox" id="qfr-show-own" class="lui-checkbox__input" aria-label="Label" checked />
                        <div class="lui-checkbox__check-wrap">
                            <span class="lui-checkbox__check"></span>
                            <span class="lui-checkbox__check-text">current <span class="qfr-counter-normal">1</span></span>
                        </div>
                    </label>
                </div>` + sheetTable +
                `<div id="qfr-spaceinfo">...</div>`,
                null, /*'Cancel'*/ null, null, null, dialogStyle
            );


            $('.qfr-close-msg').click(() => {
                $('#msg_parent_qloudFriend').remove();
            });



            var sheetCount = 0;
            // var sheetWarningCount = 0;
            for (const sheet in qlobal.sheetInfo) {
                sheetCount++;
                const thisSheet = qlobal.sheetInfo[sheet];
                // console.log('sheet description', thisSheet.description);
                var tag = '';
                if (thisSheet.description.toLowerCase().indexOf('(private)') > -1 ||
                    thisSheet.description.toLowerCase().indexOf('(priv)') > -1) {
                    tag = 'private';
                }
                if (thisSheet.description.toLowerCase().indexOf('(public)') > -1 ||
                    thisSheet.description.toLowerCase().indexOf('(publ)') > -1) {
                    tag = 'public';
                }

                const isApprovedSheet = thisSheet.approved == true;
                const isPublishedSheet = thisSheet.published == true;

                $(`#${ownId}-tbody`).append(`
                    <tr class="qfr_sheetTableRow" id="qfr_${sheet}">
                        <td>
                            ${sheet == currSheet ? '<span title="This is the current sheet" class="lui-icon  lui-icon--arrow-right"></span>' : '&nbsp;'}
                        </td>
                        <td>
                            ${thisSheet.title}
                        </td>
                        <td class="qfr-col-tag  qfr-tag-${tag}${isApprovedSheet ? '  qfr-semitransparent' : ''}">
                            ${tagHtml(tag, sheet, isApprovedSheet)}
                        </td>
                        <td class="qfr-col-published">
                            <!--span class="qfr-cb-{bgIsRight}"-->
                            <span>
                            <input type="checkbox" id="qfr_publ_${sheet}" tag="${tag}"
                                ${isPublishedSheet ? ' checked' : ''}
                                ${isApprovedSheet ? ' disabled' : ''}>
                            </span>
                        </td>
                        <td>
                            <input type="checkbox" disabled ${isApprovedSheet ? 'checked' : ''}>
                        </td>
                    </tr>`);

                // if (setRightOrWrong(sheet, tag, thisSheet.published) == 'wrong') sheetWarningCount++;
                setRightOrWrong(sheet, tag, thisSheet.published);

                // Handle click on the tag column in that row
                $(`#qfr_${sheet} .qfr-col-tag a`).click(() => {
                    $(`#${ownId}-tbody .qfr-tooltip`).hide();
                    $(`#qfr_${sheet} .qfr-tooltip`).show();
                });

                // Handle click on the "published" checkbox of that row
                $(`#qfr_publ_${sheet}`).click(async function (elem) {
                    // $(elem.target).parent().removeClass("qfr-cb-wrong qfr-cb-right");
                    const tag = $(elem.target).attr('tag');
                    if (elem.target.checked) {
                        if (await publish(sheet)) {
                            setRightOrWrong(sheet, tag, elem.target.checked);
                        } else {
                            $(`#qfr_publ_${sheet}`).prop('checked', false);
                        }
                    } else {
                        if (await unpublish(sheet)) {
                            setRightOrWrong(sheet, tag, elem.target.checked);
                        } else {
                            $(`#qfr_publ_${sheet}`).prop('checked', true);
                        }
                    }
                })
            }
            // set counters in filter row
            $('#qfr-all-counter').html(sheetCount);
            // $('#qfr-warnings-counter').html(sheetWarningCount);

            // Close tooltip if user clicked on X symbol.
            $(`.qfr-settag .lui-icon--close`).click((elem) => {
                $(`.qfr-settag`).css('display', 'none');
            });

            // handle click when user clicks on "public" in tooltip
            $(`.qfr-span-public,.qfr-span-private`).click(async function (elem) {
                const newTag = elem.target.innerText;
                const sheetId = $(elem.target).parent().attr('sheet');
                if (await setSheetTag(sheetId, newTag)) {
                    $(`.qfr-settag`).css('display', 'none');
                    $(`#qfr_${sheetId} .qfr-col-tag`)
                        .removeClass('qfr-tag- qfr-tag-private qfr-tag-public')
                        .addClass(`qfr-tag-` + newTag)
                        .find('a').html(newTag);
                    setRightOrWrong(sheetId, newTag, $(`#qfr_publ_${sheetId}`).is(':checked'));
                };
            });

            // freeze the width
            // $('.qloudFriend-dialog').css('width', ($('.qloudFriend-dialog').width() * 1.1) + 'px');

            function showRows(all, warnings, own) {
                $(`#${ownId}-tbody`).find('.qfr_sheetTableRow').each((i, elem) => {
                    if (all
                        || ($(elem).find('.qfr-cb-wrong').length && warnings)
                        || ($(elem).find('.lui-icon--arrow-right').length && own)) {
                        $(elem).show();
                    } else {
                        $(elem).hide();
                    }
                });
            }

            showRows(false, true, true);

            // handler for 3 filter checkboxes (1/3)
            $('#qfr-show-all').click((elem) => {
                if (elem.target.checked) {
                    // uncheck the other 2 checkboxes
                    $('#qfr-show-warnings').prop('checked', false);
                    $('#qfr-show-own').prop('checked', false);
                    showRows(true, false, false);
                } else {
                    $('#qfr-show-warnings').prop('checked', true);
                    $('#qfr-show-own').prop('checked', true);
                    showRows(false, true, true);
                }
            });

            // handler for 3 filter checkboxes (2/3)
            $('#qfr-show-warnings').click((elem) => {
                if (elem.target.checked) {
                    $('#qfr-show-all').prop('checked', false);
                    // $('#qfr-show-own').prop('checked', false);
                    showRows(false, true, $('#qfr-show-own').prop('checked'));
                } else {
                    showRows(false, false, $('#qfr-show-own').prop('checked'));
                }
            });

            // handler for 3 filter checkboxes (3/3)
            $('#qfr-show-own').click((elem) => {
                if (elem.target.checked) {
                    $('#qfr-show-all').prop('checked', false);
                    // $('#qfr-show-own').prop('checked', false);
                    showRows(false, $('#qfr-show-warnings').prop('checked'), true);
                } else {
                    showRows(false, $('#qfr-show-warnings').prop('checked'), false);
                }
            });

            $('.qfr-th-sort').click(function () {
                var table = $(`#${ownId}-tbody`)
                var rows = table.find('tr').toArray().sort(comparer($(this).index()));
                this.asc = !this.asc;
                if (!this.asc) {
                    rows = rows.reverse()
                }
                for (var i = 0; i < rows.length; i++) {
                    table.append(rows[i])
                }
            })
            function comparer(index) {
                return function (a, b) {
                    var valA = getCellValue(a, index), valB = getCellValue(b, index)
                    return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
                }
            }
            function getCellValue(row, index) {
                return $(row).children('td').eq(index).text()
            }

            // console.log(res);
            // Add action buttons
            $(`#msg_parent_qloudFriend .lui-dialog__footer`).append(
                `<button class="lui-button" id="qfr-btn-publish-app">Publish app</button>`
            );

            $('#qfr-btn-publish-app').click(async function () {
                $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', true);
                publishApp(app, qlobal);
            });

            $(`#msg_parent_qloudFriend .lui-dialog__footer`).append(
                `<button class="lui-button" id="qfr-btn-unpublish-sheet" style="display:none;">Checkout sheet</button>`
            );
            $(`#msg_parent_qloudFriend .lui-dialog__footer`).append(
                `<button class="lui-button" id="qfr-btn-publish-sheet" style="display:none;">Publish Sheet</button>`
            );

            if (res.action == 'unpublish') {
                $('#qfr-btn-unpublish-sheet').show();
            } else if (res.action == 'publish') {
                $('#qfr-btn-publish-sheet').show();
            }

            $(`#qfr-btn-unpublish-sheet`).click(async function () {
                $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', true);
                if (await unpublish()) {
                    $('#msg_parent_qloudFriend').remove();
                } else {
                    $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', false);
                }
            });
            $(`#qfr-btn-publish-sheet`).click(async function () {
                $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', true);
                if (await publish()) {
                    $('#msg_parent_qloudFriend').remove();
                } else {
                    $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', false);
                }
            });

            $("#qfr-spaceinfo").html(getAppInfo(app.id));

        }
    }

    async function publish(whichSheet) {
        const app = qlik.currApp();
        const enigma = app.model.enigmaModel;
        const currSheet = whichSheet || qlik.navigation.getCurrentSheetId().sheetId;
        const sheetObj = await enigma.getObject(currSheet);
        var ret = true;
        // console.log('sheetObj', sheetObj);
        if (!whichSheet) {
            qlik.navigation.setMode('analysis');
        }
        try {
            await sheetObj.publish();
        }
        catch (err) {
            leonardo.msg('qfr-error', 'Error',
                `Not possible to publish sheet: ${JSON.stringify(err)}`
                , null, 'Close', null, true);
            ret = false;
        }
        const sheetObjProp = sheetObj.getProperties();
        console.log('Sheet published', sheetObjProp);
        return ret;
    }

    async function unpublish(whichSheet) {
        const app = qlik.currApp();
        const enigma = app.model.enigmaModel;
        const currSheet = whichSheet || qlik.navigation.getCurrentSheetId().sheetId;
        const sheetObj = await enigma.getObject(currSheet)
        var ret = true;
        try {
            await sheetObj.unPublish();
        }
        catch (err) {
            leonardo.msg('qfr-error', 'Error',
                `Not possible to unpublish sheet: ${JSON.stringify(err)}`
                , null, 'Close', null, true);
            ret = false;
        }
        const sheetObjProp = sheetObj.getProperties();
        console.log('Sheet unpublished', sheetObjProp);
        if (!whichSheet) {
            setTimeout(function () {
                qlik.navigation.setMode('edit');
            }, 500);
        }
        return ret;
    }


    function setRightOrWrong(sheetId, tag, isPublished) {
        // determine color indicator for the type of sheet (published, private)
        var bgIsRight = 'unknown';
        if ((isPublished == true && tag == 'public')
            || (!(isPublished == true) && tag == 'private')) {
            bgIsRight = 'right';
        }
        if ((isPublished == true && tag == 'private')
            || (!(isPublished == true) && tag == 'public')) {
            bgIsRight = 'wrong';
        }
        $(`#qfr_${sheetId} .qfr-col-published span`).removeClass().addClass(`qfr-cb-${bgIsRight}`);
        const warnings = $(`.qloudFriend-sheetTable .qfr-cb-wrong`).length;
        $(`#qfr-warnings-counter`)
            .removeClass()
            .addClass(warnings > 0 ? 'qfr-counter-alert' : 'qfr-counter-normal')
            .html(warnings);
        return bgIsRight;
    }

    function tagHtml(tag, sheet, isApprovedSheet) {
        var ret = isApprovedSheet ?
            `<span class="qfr-roundbox">${tag}</span>` :
            `<a class="qfr-roundbox">${tag || 'set'}</a>`
        ret +=
            `<div sheet="${sheet}" class="qfr-tooltip${isApprovedSheet ? '' : ' qfr-settag'}" style="display:none;">
                <span class="qfr-span-public">public</span>
                <span class="qfr-span-private">private</span>
                <span class="lui-icon  lui-icon--small  lui-icon--close"></span>
                <div class="qfr-tooltip__arrow qfr-tooltip__arrow--left"></div>
            </div>`;
        return ret;
    }

    async function setSheetTag(sheetId, tag) {
        //alert(`coming soon to set tag "${tag}" in sheet ${sheetId}`);
        const app = qlik.currApp();
        const enigma = app.model.enigmaModel;
        const sheetObj = await enigma.getObject(sheetId);
        var sheetObjProp = await sheetObj.getProperties();
        // console.log('properties of sheet ' + sheetId, sheetObjProp);
        var ret = false
        if (sheetObjProp.descriptionExpression) {
            leonardo.msg('qfr-error', 'Error',
                `This sheet uses an expression formula in its description field. Please add the text "(${tag})" manually to the formula.`
                , null, 'Close', null, true);
        } else {
            sheetObjProp.qMetaDef.description = sheetObjProp.qMetaDef.description
                .replace('(public)', '').replace('(publ)', '')
                .replace('(private)', '').replace('(priv)', '')
                + '(' + tag + ')';
            sheetObjProp.qMetaDef.intendedUse = tag;
            await sheetObj.setProperties(sheetObjProp);
            ret = true
        }
        return ret;
    }

    function getAppInfo(appId) {
        var appInfo;
        var userInfo;
        var ownerInfo;
        var spaceInfo;
        var ret = '';
        var httpHeaders = functions.getCloudHttpHeaders();

        $.ajax({
            url: `/api/v1/users/me`,
            dataType: 'json',
            method: 'GET',
            headers: httpHeaders,
            // data: { appId: appId },
            async: false,  // wait for this call to finish.
            success: function (res) { userInfo = res; }
        });

        $.ajax({
            url: `/api/v1/apps/${appId}`,
            dataType: 'json',
            method: 'GET',
            headers: httpHeaders,
            // data: { appId: appId },
            async: false,  // wait for this call to finish.
            success: function (res) { appInfo = res; }
        });
        // console.log('this app', appInfo);

        $.ajax({
            url: `/api/v1/users/${appInfo.attributes.ownerId}`,
            dataType: 'json',
            method: 'GET',
            headers: httpHeaders,
            // data: { appId: appId },
            async: false,  // wait for this call to finish.
            success: function (res) { ownerInfo = res; }
        });
        // console.log('Owner of app', ownerInfo);

        if (appInfo.attributes.spaceId) {
            $.ajax({
                url: `/api/v1/spaces/${appInfo.attributes.spaceId}`,
                dataType: 'json',
                method: 'GET',
                headers: httpHeaders,
                // data: { appId: appId },
                async: false,  // wait for this call to finish.
                success: function (res) { spaceInfo = res; }
            })

            ret = functions.getSpaceIcon(spaceInfo.type, 'div') +
                `<div>This app is in ${spaceInfo.type} space 
                    &quot;<a href="/explore/spaces/${spaceInfo.id}" target="_blank">${spaceInfo.name}</a>&quot;
                </div>`;

        } else {
            ret = (userInfo.id == ownerInfo.id ? '' : `<div><span class="lui-icon  lui-icon--warning-triangle"></div>`)
                + functions.getSpaceIcon("personal", 'div')
                + `<div>This app is in ${userInfo.id == ownerInfo.id ? 'your' : ''} personal space`
                + (userInfo.id == ownerInfo.id ? '.' : ` of ${ownerInfo.name}.`)
                + `</div>`;
        }
        return ret;
    }


    function publishApp(app, qlobal) {

        leonardo.msg('qloudFriend', qlobal.title,
            `<div class="qloudFriend-rotate">
                <span class="lui-icon  lui-icon--reload"></span>
            </div>`,
            null, 'Close', null, null, dialogStyle);

        var httpHeaders = functions.getCloudHttpHeaders();
        var appName;

        $.ajax({
            url: `/api/v1/items?resourceType=app&resourceId=${app.id}`,
            dataType: 'json',
            method: 'GET',
            headers: httpHeaders,
            // data: { appId: appId },
            async: false,  // wait for this call to finish.
            success: function (res) {
                console.log('this app', res.data ? res.data[0] : 'no data');
                appName = res.data[0].name;
            }
        })

        // Loop the next API call as long as there are more pages (max size is 100)
        var url = `/api/v1/items?resourceType=app&limit=99`;
        var childApps = [];
        var loop = 0;
        while (url) {
            loop++;
            $.ajax({
                url: url,
                //url: `/api/v1/items?resourceType=app&limit=50`,
                dataType: 'json',
                method: 'GET',
                headers: httpHeaders,
                // data: { appId: appId },
                async: false,  // wait for this call to finish.
                success: function (res) {
                    const filteredApps = res.data.filter(e => {
                        return e.resourceAttributes ? (e.resourceAttributes.originAppId == app.id) : false
                    });
                    // console.log(`Loop ${loop}, published childs`, filteredApps);
                    childApps.push(...filteredApps);
                    // console.log(`Loop ${loop}, more?`, res.links.next);
                    url = res.links.next ? res.links.next.href : false;
                }
            })
        }
        // console.log(`after ${loop} loops I have this:`, childApps);

        if (childApps.length == 0) {

            leonardo.msg('qloudFriend', qlobal.title,
                'Note: This app has no published child apps yet.',
                null, 'Close', null, null, dialogStyle);
            $(`btn3_${ownId}`).removeAttr('disabled');

        } else {

            // Build a html table from childApps and lookup names of spaces and owners where needed

            leonardo.msg('qloudFriend', qlobal.title,
                `<div class="qfr-dataOptions">
                    <strong>Options</strong>
                    <label class="lui-radiobutton">
                        <input class="lui-radiobutton__input" type="radio" aria-label="${texts.targetData}" name="qfr-datasource" value="target" checked>
                        <div class="lui-radiobutton__radio-wrap">
                            <span class="lui-radiobutton__radio"></span>
                            <span class="lui-radiobutton__radio-text">${texts.targetData}</span>
                        </div>
                    </label>
                    <label class="lui-radiobutton">
                        <input class="lui-radiobutton__input" type="radio" aria-label="${texts.sourceData}" name="qfr-datasource" value="source">
                        <div class="lui-radiobutton__radio-wrap">
                            <span class="lui-radiobutton__radio"></span>
                            <span class="lui-radiobutton__radio-text">${texts.sourceData}</span>
                        </div>
                    </label> 
                    </div>
                    <hr/>
                    <div>Choose a child app to refesh</div>
                    <table>
                        <thead>
                            <tr>
                                <th>&nbsp;</th><th>Space</th><th>App Name</th><th>App Owner</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="qfr-tbody-applist">
                        </tbody>
                    </table>`,
                null, 'Close', null, null, dialogStyle);

            for (const childApp of childApps) {

                // API call to get the owner name of the app:
                var user;
                $.ajax({
                    url: `/api/v1/users/${childApp.ownerId}`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) {
                        user = res;
                    }
                })
                // API call to get the space name of the app:
                var space;
                $.ajax({
                    url: `/api/v1/spaces/${childApp.spaceId}`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) {
                        space = res;
                    }
                });

                $(`#qfr-tbody-applist`).append(
                    `<tr>
                            <td style="vertical-align:bottom;">${functions.getSpaceIcon('managed')}</td>
                            <td><a href="/explore/spaces/${space.id}" target="_blank">${space.name}</a></td>
                            <td><a href="/sense/app/${childApp.resourceId}" target="_blank">${childApp.name}</a></td>
                            <td>${user.name}</td>
                            <td><button class="lui-button" id="publ_${childApp.resourceId}" style="height:unset;">Refresh</button></td>
                        </tr>`);

                $(`#publ_${childApp.resourceId}`).click(() => {
                    $(`#publ_${childApp.resourceId}`).attr('disabled', true);

                    $.ajax({
                        url: `/api/v1/apps/${app.id}/publish`,
                        // dataType: 'json',
                        method: 'PUT',
                        contentType: "application/json",
                        headers: httpHeaders,
                        data: JSON.stringify({
                            targetId: childApp.resourceId,
                            data: $('[name="qfr-datasource"]:checked').val() || 'target'
                        }),
                        async: false,  // wait for this call to finish.
                        success: function (res) {
                            leonardo.msg('qloudFriend', qlobal.title,
                                `<div class="lui-text-success">
                                    <span class="lui-icon  lui-icon--large  lui-icon--tick"></span>
                                    Success
                                </div>
                                <div><a href="/sense/app/${childApp.resourceId}" target="_blank">${childApp.name}</a> 
                                    in space &quot;${space.name}&quot; has been successfully republished.
                                </div>`,
                                null, 'Close');
                        },
                        error: function (err) {
                            functions.showApiError(err);
                        }
                    });
                })
            }

        }
    }
});
