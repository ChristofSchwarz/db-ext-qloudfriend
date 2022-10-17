// Main qloudFriend window handler

define(["qlik", "jquery", "./leonardo", "./functions", "text!./html/window.html"], function
    (qlik, $, leonardo, functions, rawHtml) {

    const markSelector = '.sheet-title-container';

    const close_button = `
        <button class="lui-button qfr-close-msg" style="float:right;padding: 0 5px;min-width: 20px;height: unset;">
            <span class="lui-icon  lui-icon--small  lui-icon--close"></span>
        </button>`;

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
                        qloudfriendTag: sheet.qMeta.qloudfriendTag
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

        friendButton: async function (ownId, layout, qlobal) {

            console.log('friendButton clicked', qlobal);

            const app = qlik.currApp();
            const currSheet = qlik.navigation.getCurrentSheetId().sheetId;

            // leonardo.msg('qloudFriend', qlobal.title,
            //     `<div class="qloudFriend-rotate">
            //         <span class="lui-icon  lui-icon--reload"></span>
            //     </div>`,
            //     null, 'Cancel', null, null, dialogStyle
            // );


            const html = rawHtml
                .replace(new RegExp('{{ownId}}', 'g'), ownId)
                .replace(new RegExp('{{spaceInfo}}', 'g'), getAppInfoHtml(qlobal))
                .replace(new RegExp('{{texts.sourceData}}', 'g'), texts.sourceData)
                .replace(new RegExp('{{texts.targetData}}', 'g'), texts.targetData)


            // Render the main window
            leonardo.msg('qloudFriend', qlobal.title + close_button, html,
                null, /*'Cancel'*/ null, null, null, dialogStyle
            );

            const res = await getSheetStatus(ownId, layout, qlobal);

            $('.qloudFriend-rotate').hide();
            $('#qfr-sheetlist-section').show();

            // Handle for "X" button
            $('.qfr-close-msg').click(() => {
                $('#msg_parent_qloudFriend').remove();
            });


            var sheetCount = 0;
            for (const sheet in qlobal.sheetInfo) {

                sheetCount++;
                const thisSheet = qlobal.sheetInfo[sheet];
                var tag = thisSheet.qloudfriendTag


                const isApprovedSheet = thisSheet.approved == true;
                const isPublishedSheet = thisSheet.published == true;

                $(`#${ownId}-tbody`).append(`
                    <tr class="qfr_sheetTableRow" id="qfr_tr_${sheet}" 
                        sheet="${sheet}" tag="${tag}">
                        <td>
                            ${sheet == currSheet ? '<span title="This is the current sheet" class="lui-icon  lui-icon--arrow-right"></span>' : '&nbsp;'}
                        </td>
                        <td>
                            ${thisSheet.title}
                        </td>
                        <td class="qfr-col-tag  qfr-tag-${tag}${isApprovedSheet ? '  qfr-semitransparent' : ''}">
                            ${tagHtml(tag, isApprovedSheet)}
                        </td>
                        <td class="qfr-col-published">
                            <!--span class="qfr-cb-{bgIsRight}"-->
                            <span>
                            <input type="checkbox" id="qfr_cb_published_${sheet}" 
                                ${isPublishedSheet ? ' checked' : ''}
                                ${isApprovedSheet ? ' disabled' : ''}>
                            </span>
                        </td>
                        <td>
                            <input type="checkbox" disabled ${isApprovedSheet ? 'checked' : ''}>
                        </td>
                    </tr>`);

                setRightOrWrong(sheet, tag, thisSheet.published);

                // Handle click on the tag column in that row
                $(`#qfr_tr_${sheet} .qfr-col-tag a`).click(() => {
                    $(`#${ownId}-tbody .qfr-tooltip`).hide();
                    const offset1 = $(`#qfr_tr_${sheet}`).offset();
                    const offset2 = $(`#qfr_tr_${sheet}`).parents('table').find('th:nth-of-type(1)').offset();
                    const offset3 = $(`.qloudFriend-dialog`).offset();
                    console.log(offset1.top, offset2.top, offset3.top);
                    $(`#qfr_tr_${sheet} .qfr-tooltip`).css('top', 13 + offset1.top - offset2.top + offset3.top).show();
                });

                // Handle click on the "published" checkbox of that row
                $(`#qfr_cb_published_${sheet}`).click(async function (elem) {
                    // $(elem.target).parent().removeClass("qfr-cb-wrong qfr-cb-right");
                    const sheetId = $(elem.target).parents('tr').attr('sheet');
                    const tag = qlobal.sheetInfo[sheetId].qloudfriendTag; //$(elem.target).parents('tr').attr('tag');
                    if (elem.target.checked) {
                        if (await publishSheet(sheet, qlobal)) {
                            setRightOrWrong(sheet, tag, elem.target.checked);
                        } else {
                            $(`#qfr_cb_published_${sheet}`).prop('checked', false);
                        }
                    } else {
                        if (await unpublishSheet(sheet, qlobal)) {
                            setRightOrWrong(sheet, tag, elem.target.checked);
                        } else {
                            $(`#qfr_cb_published_${sheet}`).prop('checked', true);
                        }
                    }
                })
            }

            // set counter in filter row
            $('#qfr-all-counter').html(sheetCount);

            // show the right rows (initial filter settings)
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

            // Close tooltip if user clicked on X symbol.
            $(`.qfr-settag .lui-icon--close`).click((elem) => {
                $(`.qfr-settag`).css('display', 'none');
            });

            // handle click when user clicks on "public" or "private" in tooltip
            $(`.qfr-span-public,.qfr-span-private`).click(async function (elem) {
                const newTag = elem.target.innerText;
                const sheetId = $(elem.target).parents('tr').attr('sheet');
                const wasPublished = qlobal.sheetInfo[sheetId].published;
                $(elem.target).css('opacity', '50%');
                var cont = true;
                if (wasPublished) {
                    // for a moment, unpublish the sheet
                    cont = await unpublishSheet(sheetId, qlobal);
                }
                if (cont) {
                    if (await setSheetTag(sheetId, newTag, qlobal)) {
                        $(elem.target).css('opacity', '');
                        $(`.qfr-settag`).css('display', 'none');
                        if (wasPublished) {
                            // if it was published before, publish again
                            await publishSheet(sheetId, qlobal);
                        }
                        $(`#qfr_tr_${sheetId} .qfr-col-tag`)
                            .removeClass('qfr-tag- qfr-tag-private qfr-tag-public')
                            .addClass(`qfr-tag-` + newTag)
                            .find('a').html(newTag);
                        setRightOrWrong(sheetId, newTag, $(`#qfr_cb_published_${sheetId}`).is(':checked'));
                    } else if (wasPublished) {
                        // if it was published before, publish again
                        await publishSheet(sheetId, qlobal);
                    }
                }
            });

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

            // Handler for table sorting when clicking on th
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


            // Add "publish app" action button
            if (qlobal.childApps.length > 0) {
                $(`#msg_parent_qloudFriend .lui-dialog__footer`).append(
                    `<button class="lui-button" id="qfr-btn-publish-app">Republish app</button>`
                );

                $('#qfr-btn-publish-app').click(async function () {
                    $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', true);
                    publishApp(app, qlobal);
                });
            }

            /*
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
                if (await unpublishSheet(currSheet, qlobal, true)) {
                    $('#msg_parent_qloudFriend').remove();
                } else {
                    $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', false);
                }
            });
            $(`#qfr-btn-publish-sheet`).click(async function () {
                $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', true);
                if (await publishSheet(currSheet, qlobal, true)) {
                    $('#msg_parent_qloudFriend').remove();
                } else {
                    $('#msg_parent_qloudFriend .lui-dialog__footer button').prop('disabled', false);
                }
            });
            */

        }
    }

    async function publishSheet(whichSheet, qlobal, analysisMode = false) {
        const app = qlik.currApp();
        const enigma = app.model.enigmaModel;
        const currSheet = whichSheet || qlik.navigation.getCurrentSheetId().sheetId;
        const sheetObj = await enigma.getObject(currSheet);
        var ret = true;
        // console.log('sheetObj', sheetObj);
        if (analysisMode) {
            qlik.navigation.setMode('analysis');
        }
        try {
            await sheetObj.publish();
            qlobal.sheetInfo[whichSheet].published = true;
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

    async function unpublishSheet(whichSheet, qlobal, editMode = false) {
        const app = qlik.currApp();
        const enigma = app.model.enigmaModel;
        const currSheet = whichSheet || qlik.navigation.getCurrentSheetId().sheetId;
        const sheetObj = await enigma.getObject(currSheet)
        var ret = true;
        try {
            await sheetObj.unPublish();
            qlobal.sheetInfo[whichSheet].published = false;
        }
        catch (err) {
            leonardo.msg('qfr-error', 'Error',
                `Not possible to unpublish sheet: ${JSON.stringify(err)}`
                , null, 'Close', null, true);
            ret = false;
        }
        const sheetObjProp = sheetObj.getProperties();
        console.log('Sheet unpublished', sheetObjProp);
        if (editMode) {
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
        $(`#qfr_tr_${sheetId} .qfr-col-published span`).removeClass().addClass(`qfr-cb-${bgIsRight}`);
        const warnings = $(`.qloudFriend-sheetTable .qfr-cb-wrong`).length;
        $(`#qfr-warnings-counter`)
            .removeClass()
            .addClass(warnings > 0 ? 'qfr-counter-alert' : 'qfr-counter-normal')
            .html(warnings);
        return bgIsRight;
    }

    function tagHtml(tag, isApprovedSheet) {
        var ret = isApprovedSheet ?
            `<span class="qfr-roundbox">${tag || ''}</span>` :
            `<a class="qfr-roundbox">${tag || 'set'}</a>`
        ret +=
            `<div class="qfr-tooltip${isApprovedSheet ? '' : ' qfr-settag'}" style="display:none;">
                <span class="qfr-span-public">public</span>
                <span class="qfr-span-private">private</span>
                <span class="lui-icon  lui-icon--small  lui-icon--close"></span>
                <div class="qfr-tooltip__arrow qfr-tooltip__arrow--left"></div>
            </div>`;
        return ret;
    }

    async function setSheetTag(sheetId, tag, qlobal) {

        const app = qlik.currApp();
        const enigma = app.model.enigmaModel;
        const sheetObj = await enigma.getObject(sheetId);
        var sheetObjProp = await sheetObj.getProperties();
        // console.log('properties of sheet ' + sheetId, sheetObjProp);
        var ret = false

        sheetObjProp.qMetaDef.qloudfriendTag = tag;
        try {
            await sheetObj.setProperties(sheetObjProp);
            ret = true;
            // update global
            qlobal.sheetInfo[sheetId].qloudfriendTag = tag;
        }
        catch (err) {
            leonardo.msg('qfr-error', 'Error setProperties',
                JSON.stringify(err), null, 'Close', null, true);
            ret = false;
        }
        return ret;
    }

    function getAppInfoHtml(qlobal) {

        var ret;
        if (qlobal.spaceInfo) {
            ret = functions.getSpaceIcon(qlobal.spaceInfo.type, 'div') +
                `<div>This app is in ${qlobal.spaceInfo.type} space 
                    &quot;<a href="/explore/spaces/${qlobal.spaceInfo.id}" target="_blank">${qlobal.spaceInfo.name}</a>&quot;
                </div>`;

        } else {
            ret = (qlobal.userInfo.id == qlobal.ownerInfo.id ? ''
                : `<div><span class="lui-icon  lui-icon--warning-triangle"></div>`)
                + functions.getSpaceIcon("personal", 'div')
                + `<div>This app is in ${qlobal.userInfo.id == qlobal.ownerInfo.id ? 'your' : ''} personal space`
                + (qlobal.userInfo.id == qlobal.ownerInfo.id ? '.' : ` of ${qlobal.ownerInfo.name}.`)
                + `</div>`;
        }
        return ret;
    }


    function publishApp(app, qlobal) {

        $('#qfr-sheetlist-section').hide();
        $('#qfr-spaceinfo').hide();
        $('#qfr-publishapp-section').show();

        var httpHeaders = functions.getCloudHttpHeaders();

        for (const childApp of qlobal.childApps) {

            // API call to get the owner name of the app:
            var user;
            $.ajax({
                url: `/api/v1/users/${childApp.ownerId}`,
                dataType: 'json',
                method: 'GET',
                headers: httpHeaders,
                async: false,  // wait for this call to finish.
                success: function (res) { user = res; }
            })
            // API call to get the space name of the app:
            var space;
            $.ajax({
                url: `/api/v1/spaces/${childApp.spaceId}`,
                dataType: 'json',
                method: 'GET',
                headers: httpHeaders,
                async: false,  // wait for this call to finish.
                success: function (res) { space = res; }
            });

            $(`#qfr-tbody-applist`).append(
                `<tr>
                    <td style="vertical-align:bottom;">${functions.getSpaceIcon('managed')}</td>
                    <td><a href="/explore/spaces/${space.id}" target="_blank">${space.name}</a></td>
                    <td><a href="/sense/app/${childApp.resourceId}" target="_blank">${childApp.name}</a></td>
                    <td>${user.name}</td>
                    <td><button class="lui-button" id="publ_${childApp.resourceId}">Refresh</button></td>
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
});
