// Main qloudFriend window handler

define(["qlik", "jquery", "./leonardo", "text!../html/window.html", "text!../texts.json"], function
    (qlik, $, leonardo, windowHtml, textsLoader) {

    const texts = JSON.parse(textsLoader);
    // if (!leonardo) console.warn('within mainWindow: leonardo object', leonardo);

    const closeAndHelpButtons = `
        <button class="lui-button qfr-close-msg">
            <span class="lui-icon  lui-icon--small  lui-icon--close"></span>
        </button>
        <a class="qfr-openhelp" href="${texts.githubHelpPage}" target="_blank">
            <span class="lui-icon lui-icon--help"></span>
        </a>`;

    const dialogStyle = 'right:0;top:0;left:unset;width:540px;';

    const functions = {
        setVisibilityActionButtons: function (qlobal, currSheetId) {

            $(`#qfr-btn-publish-sheet`).hide();
            $(`#qfr-btn-unpublish-sheet`).hide();

            if (qlobal.sheetInfo[currSheetId].published && !qlobal.sheetInfo[currSheetId].approved) {
                $(`#qfr-btn-unpublish-sheet`).show();
            }
            if (!qlobal.sheetInfo[currSheetId].published && !qlobal.sheetInfo[currSheetId].approved) {
                $(`#qfr-btn-publish-sheet`).show();
            }
        },

        getObjectSheetList: function (layout, qlobal) {
            // returns a Promise to filling the qlobal.sheetInfo object.
            return new Promise((resolve, reject) => {
                // const enigma = app.model.enigmaModel;
                const app = qlik.currApp();
                // const currSheetId = qlik.navigation.getCurrentSheetId().sheetId;
                var sheetInfo = {};
                // var suggestedAction = '?';

                app.getAppObjectList('sheet', function (reply) {
                    var sortList = []; // make a separate array of ranks for later sorting
                    for (const sheet of reply.qAppObjectList.qItems) {
                        // console.log('sheet', sheet);
                        // $.each(reply.qAppObjectList.qItems, function (key, sheet) {
                        sheetInfo[sheet.qInfo.qId] = {
                            rank: sheet.qData.rank,
                            title: sheet.qMeta.title,
                            description: sheet.qData.description || sheet.qData.descriptionExpression,
                            ownerId: sheet.qMeta.ownerId,
                            published: sheet.qMeta.published == true,
                            approved: sheet.qMeta.approved == true,
                            sortOrder: (sheet.qMeta.published == true ? 0 : 10000) + sheet.qData.rank,
                            qloudfriendTag: sheet.qMeta.qloudfriendTag
                        };
                        sortList.push(sheetInfo[sheet.qInfo.qId].sortOrder);
                    };
                    sortList = sortList.sort(function (a, b) { return a - b }); // now sort array numerically
                    for (const sheet in sheetInfo) {
                        sheetInfo[sheet].sortOrder = sortList.indexOf(sheetInfo[sheet].sortOrder) + 1;
                    }
                    // const thisSheet = sheetInfo[currSheetId];
                    qlobal.sheetInfo = sheetInfo; // put sheetinfo to qlobal object

                    resolve(true);

                });
            })
        },

        setClassRightWrong: function (sheetId, tag, isPublished) {

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
            $(`[sheet="${sheetId}"] .qfr-col-published span`).removeClass().addClass(`qfr-cb-${bgIsRight}`);
            const warnings = $(`.qfr-sheetTable .qfr-cb-wrong`).length;
            $(`#qfr-warnings-counter`)
                .removeClass()
                .addClass(warnings > 0 ? 'qfr-counter-alert' : 'qfr-counter-normal')
                .html(warnings);
            return bgIsRight;
        },

        getHtmlTagTooltip: function (tag, isApprovedSheet) {
            // returns the html that goes into the table cell where the tag
            // or the "set" link is shown
            var ret = isApprovedSheet ?
                `<span class="qfr-roundbox">${tag || ''}</span>` :
                `<a class="qfr-roundbox">${tag || 'set'}</a>`
            ret +=
                `<div class="qfr-tooltip2${isApprovedSheet ? '' : ' qfr-settag'}" style="display:none;">
                <span class="qfr-span-public">public</span>
                <span class="qfr-span-private">private</span>
                <span class="lui-icon  lui-icon--small  lui-icon--close"></span>
                <div class="qfr-tooltip__arrow qfr-tooltip__arrow--left"></div>
            </div>`;
            return ret;
        },

        getHtmlTitleTooltip: function (title) {
            // returns the html that goes into the table cell of the sheet title
            var ret = `<a>${title}</a>
            <div class="qfr-tooltip1 qfr-settag" style="display:none;">
                <span class="lui-icon  lui-icon--forward  qfr-tooltip1-menu" title="Go to sheet"></span>
                <span class="lui-icon  lui-icon--bin  qfr-tooltip1-menu" title="Delete sheet"></span>
                <span class="qfr-tooltip1-confirm" style="display:none;">Delete sheet now?
                    <a class="qfr-del-sheet-now">Yes</a>
                </span>
                <span class="lui-icon  lui-icon--small  lui-icon--close"></span>
                <div class="qfr-tooltip__arrow qfr-tooltip__arrow--left"></div>
            </div>`;
            return ret;
        },

        getHtmlAppInfo: function (qlobal) {
            // returns the html with info about the space of the app
            // shown in the footer of the window
            var ret;
            if (qlobal.spaceInfo) {
                ret = functions.getHtmlSpaceIcon(qlobal.spaceInfo.type, 'div') +
                    `<div>This app is in ${qlobal.spaceInfo.type} space 
                    <a href="/explore/spaces/${qlobal.spaceInfo.id}" target="_blank">${qlobal.spaceInfo.name}</a>
                    <br/>${qlobal.ownerInfo.id == qlobal.userInfo.id ? 'You are the app owner' : 'App owner is ' + qlobal.ownerInfo.name}.
                </div>`;

            } else {
                ret = (qlobal.userInfo.id == qlobal.ownerInfo.id ? ''
                    : `<div><span class="lui-icon  lui-icon--warning-triangle"></div>`)
                    + functions.getHtmlSpaceIcon("personal", 'div')
                    + `<div>This app is in ${qlobal.userInfo.id == qlobal.ownerInfo.id ? 'your' : ''} personal space`
                    + (qlobal.userInfo.id == qlobal.ownerInfo.id ? '.' : ` of ${qlobal.ownerInfo.name}.`)
                    + `</div>`;
            }
            return ret;
        },

        getHtmlSheetList: function (qlobal, currSheetId) {

            // renders the sheet list html table and registers the event handlers

            $(`#qfr-sheetTable-tbody`).empty();
            var sheetCount = 0;
            // work through the object keys in sortOrder 
            // for (const sheet in qlobal.sheetInfo) {
            $.map(qlobal.sheetInfo, (v, i) => { v.objId = i; return v })
                .sort((p1, p2) => { return p1.sortOrder - p2.sortOrder }).forEach((thisSheet) => {

                    const sheetId = thisSheet.objId
                    sheetCount++;
                    // const thisSheet = qlobal.sheetInfo[sheet];
                    var tag = thisSheet.qloudfriendTag

                    const isApprovedSheet = thisSheet.approved == true;
                    const isApprovedApp = qlobal.appInfo.attributes ? qlobal.appInfo.attributes.published : false;
                    const isPublishedSheet = thisSheet.published == true;

                    $(`#qfr-sheetTable-tbody`).append(`
                    <tr class="qfr-sheetTableRow" ` /* id="qfr_tr_${sheetId}" */ + ` 
                        sheet="${sheetId}" tag="${tag}">
                        <td class="qfr-col-currsheet">
                            <span title="This is the current sheet" class="lui-icon  lui-icon--arrow-right  qfr-currSheetMarker"
                                ${sheetId == currSheetId ? '' : 'style="display:none;"'}></span>
                        </td>
                        <td class="qfr-col-rank">${thisSheet.sortOrder}</td>
                        <td class="qfr-col-title">
                            ${functions.getHtmlTitleTooltip(thisSheet.title)}
                        </td>
                        <td class="qfr-col-tag  qfr-tag-${tag}${isApprovedApp ? '  qfr-semitransparent' : ''}">
                            ${functions.getHtmlTagTooltip(tag, isApprovedApp)}
                        </td>
                        <td class="qfr-col-published">
                            <!--span class="qfr-cb-{bgIsRight}"-->
                            <span>
                            <input type="checkbox" class="qfr_cb_published" 
                                ${isPublishedSheet ? ' checked' : ''}
                                ${isApprovedApp ? ' disabled' : ''}>
                            </span>
                        </td>
                        <td class="qfr-col-approved">
                            <input type="checkbox" disabled ${isApprovedSheet ? 'checked' : ''}>
                        </td>
                    </tr>`);

                    functions.setClassRightWrong(sheetId, tag, thisSheet.published);
                });

            events.clickSheetName(); // opens tooltip1
            events.clickOpenTagMenu(); // opens tooltip2
            events.clickPublishCheckbox(qlobal);
            events.clickChangeTag(qlobal);
            events.clickTooltip1Close();
            events.clickTooltip2Close();
            events.clickGoToSheet(qlobal);
            events.clickDeleteIcon();
            events.clickDeleteYes(qlik.currApp(), qlobal);

            // set counter in filter row
            $('#qfr-all-counter').html(sheetCount);



        },

        setVisibilityTableRows: function (all, warnings, own) {
            // changes visibility of html table rows 
            $('.qfr-sheetTableRow').each((i, elem) => {
                if (all
                    || ($(elem).find('.qfr-cb-wrong').length && warnings)
                    || ($(elem).find('.qfr-currSheetMarker').css('display') != 'none' && own)) {
                    $(elem).show();
                } else {
                    $(elem).hide();
                }
            });
        },

        getHtmlSpaceIcon: function (type, tag = 'span') {
            var ret = '';

            if (type == 'managed') {
                ret = `<${tag} class="qfr-managedSpaceIcon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16px" fill="currentColor" aria-hidden="true"><path d="M8 0a2.002 2.002 0 0 1 1.91 2.596l1.673.993A2.002 2.002 0 0 1 15 5c0 .937-.646 1.725-1.516 1.942V9.06A2.003 2.003 0 0 1 15 11c0 1.104-.897 2-2 2s-2-.897-2-2c0-.936.646-1.724 1.516-1.94V6.94a2.003 2.003 0 0 1-1.42-2.555l-1.665-.989a2 2 0 0 1-.947.545v2.118A2.003 2.003 0 0 1 10 8a2.001 2.001 0 0 1-3.433 1.394l-1.664.99c.13.401.13.834-.001 1.235l1.664.988A1.994 1.994 0 0 1 8 12c1.103 0 2 .897 2 2s-.897 2-2 2a2.002 2.002 0 0 1-1.91-2.591l-1.677-.995A1.994 1.994 0 0 1 3 13c-1.103 0-2-.897-2-2s.897-2 2-2c.553 0 1.054.225 1.416.589l1.674-.996A2.003 2.003 0 0 1 7.516 6.06V3.941a2 2 0 0 1-.946-.544l-1.666.989A2.002 2.002 0 0 1 3 7c-1.103 0-2-.897-2-2s.897-2 2-2c.553 0 1.055.226 1.417.59l1.673-.994A2.002 2.002 0 0 1 8 0Zm0 13c-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1 0-.551-.449-1-1-1Zm5-3c-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1 0-.551-.449-1-1-1ZM3 10c-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1 0-.551-.449-1-1-1Zm5-3c-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1 0-.551-.449-1-1-1ZM3 4c-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1 0-.551-.449-1-1-1Zm10 0c-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1 0-.551-.449-1-1-1ZM8 1c-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1 0-.551-.449-1-1-1Z"></path>
            </svg></${tag}>`
            } else if (type == 'shared') {
                ret = `<${tag} class="qfr-sharedSpaceIcon">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" height="16px" fill="currentColor" aria-hidden="true"><defs><path id="space_shared_svg__luiicons_space_shared-a" d="M13.88 12.993A7.24 7.24 0 0 1 8 16a7.24 7.24 0 0 1-5.88-3.007c.36-.044.662-.28.8-.601A6.242 6.242 0 0 0 8 15a6.242 6.242 0 0 0 5.08-2.608c.138.322.44.557.8.6Zm.887-1.634a.998.998 0 0 0-.94-.344 6.251 6.251 0 0 0-4.995-8.46.994.994 0 0 0 .063-1 7.251 7.251 0 0 1 5.872 9.804Zm-13.534 0a7.251 7.251 0 0 1 5.871-9.804.994.994 0 0 0 .064 1 6.251 6.251 0 0 0-4.995 8.46 1.002 1.002 0 0 0-.94.344ZM6 1.999C6 .898 6.897 0 8 0s2 .897 2 2-.897 2-2 2-2-.897-2-2ZM9 2c0-.551-.449-1-1-1-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1Zm3 10c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2-2-.897-2-2Zm3 0c0-.551-.449-1-1-1-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1ZM0 12c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2-2-.897-2-2Zm3 0c0-.551-.449-1-1-1-.551 0-1 .449-1 1 0 .551.449 1 1 1 .551 0 1-.449 1-1Z"></path></defs><use xlink:href="#space_shared_svg__luiicons_space_shared-a"></use>
            </svg></${tag}>`
            } else if (type == 'personal') {
                ret = `<${tag} class="qfr-personalSpaceIcon">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M5,10 L11,10 C13.7614237,10 16,12.2385763 16,15 L0,15 C-3.38176876e-16,12.2385763 2.23857625,10 5,10 Z M8,9 C5.790861,9 4,7.209139 4,5 C4,2.790861 5.790861,1 8,1 C10.209139,1 12,2.790861 12,5 C12,7.209139 10.209139,9 8,9 Z" fill="#404040"></path>
            </svg></${tag}>`
            }
            return ret
        },

        getWrongSheetsCount: function (qlobal) {
            // returns a number of wrongly set sheets (sheets unpublished that should be public
            // or sheets published that should be private)
            var sheetsWrong = 0;
            for (const sheetId in qlobal.sheetInfo) {
                sheetsWrong += ((qlobal.sheetInfo[sheetId].published == true
                    && qlobal.sheetInfo[sheetId].qloudfriendTag == 'private') ||
                    (!(qlobal.sheetInfo[sheetId].published == true)
                        && qlobal.sheetInfo[sheetId].qloudfriendTag == 'public'));
            };
            return sheetsWrong;
        }
    }

    const events = {

        clickSheetName: function () {
            // Handle click on the sheet name
            $(`.qfr-col-title a`).click((elem) => {
                const sheet = other.getSheetIdOfElem(elem);
                // hide other tooltips
                $(`#qfr-sheetTable-tbody .qfr-tooltip1`).hide();
                $(`#qfr-sheetTable-tbody .qfr-tooltip2`).hide();
                const offset1 = $(`[sheet="${sheet}"]`).offset();
                const offset2 = $(`[sheet="${sheet}"]`).parents('table').find('th:nth-of-type(1)').offset();
                const offset3 = $(`.qfr-dialog`).offset();
                // console.log(offset1.top, offset2.top, offset3.top);
                $(`.qfr-tooltip1-menu`).show();
                $(`.qfr-tooltip1-confirm`).hide();
                $(`[sheet="${sheet}"] .qfr-tooltip1`).show()
                    .css('top', 13 + offset1.top - offset2.top + offset3.top);
                if (sheet == qlik.navigation.getCurrentSheetId().sheetId) {
                    $(`[sheet="${sheet}"] .qfr-tooltip1  .lui-icon--forward`).hide();
                } else {
                    $(`[sheet="${sheet}"] .qfr-tooltip1  .lui-icon--forward`).show();
                }
            });
        },

        clickOpenTagMenu: function () {
            // Handle click on the tag icon in a row
            // This will open the tooltip2 (menu to set another tag)
            $(`.qfr-col-tag a`).click((elem) => {
                const sheet = other.getSheetIdOfElem(elem);
                // hide other tooltips
                $(`#qfr-sheetTable-tbody .qfr-tooltip1`).hide();
                $(`#qfr-sheetTable-tbody .qfr-tooltip2`).hide();
                const offset1 = $(`[sheet="${sheet}"]`).offset();
                const offset2 = $(`[sheet="${sheet}"]`).parents('table').find('th:nth-of-type(1)').offset();
                const offset3 = $(`.qfr-dialog`).offset();
                // console.log(offset1.top, offset2.top, offset3.top);
                $(`[sheet="${sheet}"] .qfr-tooltip2`).css('top', 13 + offset1.top - offset2.top + offset3.top).show();
            });
        },

        clickPublishCheckbox: async function (qlobal) {
            // Handle click on the "published" checkbox of that row
            $(`.qfr_cb_published`).click(async function (elem) {
                const sheet = other.getSheetIdOfElem(elem);
                const currSheetId = qlik.navigation.getCurrentSheetId().sheetId;
                // $(elem.target).parent().removeClass("qfr-cb-wrong qfr-cb-right");
                const tag = qlobal.sheetInfo[sheet].qloudfriendTag; //$(elem.target).parents('tr').attr('tag');
                if (elem.target.checked) {
                    if (await other.publishSheet(sheet, qlobal)) {
                        functions.setClassRightWrong(sheet, tag, elem.target.checked);
                        functions.setVisibilityActionButtons(qlobal, currSheetId);
                    } else {
                        $(elem.target).prop('checked', false);
                    }
                } else {
                    if (await other.unpublishSheet(sheet, qlobal)) {
                        functions.setClassRightWrong(sheet, tag, elem.target.checked);
                        functions.setVisibilityActionButtons(qlobal, currSheetId);
                    } else {
                        $(elem.target).prop('checked', true);
                    }
                }
            })
        },

        clickChangeTag: function (qlobal) {
            // handle click when user clicks on "public" or "private" in tooltip
            $(`.qfr-span-public,.qfr-span-private`).click(async function (elem) {
                const newTag = elem.target.innerText;
                const sheetId = other.getSheetIdOfElem(elem);
                const wasPublished = qlobal.sheetInfo[sheetId].published;
                $(elem.target).css('opacity', '50%');
                var cont = true;
                if (wasPublished) {
                    // for a moment, unpublish the sheet
                    cont = await other.unpublishSheet(sheetId, qlobal);
                }
                if (cont) {
                    if (await other.setSheetTag(sheetId, newTag, qlobal)) {
                        $(elem.target).css('opacity', '');
                        $(`.qfr-settag`).hide();
                        if (wasPublished) {
                            // if it was published before, publish again
                            await other.publishSheet(sheetId, qlobal);
                        }
                        $(`[sheet="${sheetId}"] .qfr-col-tag`)
                            .removeClass('qfr-tag- qfr-tag-private qfr-tag-public')
                            .addClass(`qfr-tag-` + newTag)
                            .find('a').html(newTag);
                        functions.setClassRightWrong(sheetId, newTag
                            , $(`[sheet="${sheetId}"] .qfr_cb_published`).is(':checked'));
                    } else if (wasPublished) {
                        // if it was published before, publish again
                        await other.publishSheet(sheetId, qlobal);
                    }
                }
            });
        },

        clickButtonUnpublishSheet: function (qlobal, currSheetId) {

            // Handler for Unpublish Sheet button
            $(`#qfr-btn-unpublish-sheet`).click(async function () {
                $('#msg_parent_qfr-main .lui-dialog__footer button').prop('disabled', true);
                if (await other.unpublishSheet(currSheetId, qlobal, true)) {
                    $('#msg_parent_qfr-main').remove();
                } else {
                    $('#msg_parent_qfr-main .lui-dialog__footer button').prop('disabled', false);
                }
            });
        },

        clickButtonPublishSheet: function (qlobal, currSheetId) {
            // Handler for Publish Sheet button
            $(`#qfr-btn-publish-sheet`).click(async function () {
                $('#msg_parent_qfr-main .lui-dialog__footer button').prop('disabled', true);
                if (await other.publishSheet(currSheetId, qlobal, true)) {
                    $('#msg_parent_qfr-main').remove();
                } else {
                    $('#msg_parent_qfr-main .lui-dialog__footer button').prop('disabled', false);
                }
            });
        },

        clickButtonChgOwner: function (qlobal) {
            // Handler for Change Owner button
            $(`#qfr-btn-chgowner`).click(function () {
                leonardo.msg('qfr-confirm', 'Confirm',
                    `<div class="lui-text">
                        ${qlobal.texts.questionTakeAway1} ${qlobal.ownerInfo.name}? 
                    </div>
                    <div>${qlobal.texts.questionTakeAway2}</div>`
                    , 'Yes', 'No', null);
                $('#msg_ok_qfr-confirm').click(() => {
                    $('#msg_parent_qfr-confirm').remove();
                    $('#msg_parent_qfr-main').remove();
                    apiCtrl.changeAppOwner(qlobal);
                })
                //apiCtrl.reloadApp(ownId, app, qlobal);
            })
        },

        clickButtonReload: function (ownId, app, qlobal) {
            // Handler for Reload button
            $(`#qfr-btn-reload2`).click(function () {
                $('#msg_parent_qfr-main').remove();
                apiCtrl.reloadApp(ownId, app, qlobal);
            })
        },

        clickButtonPublishApp: function (qlobal, app, htmlSpaceIconManaged) {
            $('#qfr-btn-publish-app').click(async function () {
                $('#msg_parent_qfr-main .lui-dialog__footer button').prop('disabled', true);
                $('#qfr-sheetlist-section').hide();
                $('#qfr-spaceinfo').hide();
                $('#qfr-publishapp-section').show();
                const wrongSheetsCount = functions.getWrongSheetsCount(qlobal);
                if (wrongSheetsCount) {
                    $('#qfr-publishapp-warning-text')
                        .text(`${wrongSheetsCount} ${wrongSheetsCount > 1 ? qlobal.texts.infoWrongStateMany : qlobal.texts.infoWrongStateOne}`);
                    $('#qfr-publishapp-warning').show();
                } else {
                    $('#qfr-publishapp-warning').hide();
                }
                apiCtrl.publishApp(app, qlobal, htmlSpaceIconManaged);
            });
        },

        clickButtonBackToList: function (qlobal, currSheetId) {
            $('#qfr-btn-backtolist').click(() => {
                $('#qfr-publishapp-section').hide();
                $('#qfr-sheetlist-section').show();
                $('#qfr-spaceinfo').show();
                $('#msg_parent_qfr-main .lui-dialog__footer button').prop('disabled', false);
                // functions.setVisibilityActionButtons(qlobal, currSheetId);
            })
        },

        clickTableHeaderSort: function () {
            // Handler for table sorting when clicking on th
            $('.qfr-th-sort').click(function () {
                var table = $(`#qfr-sheetTable-tbody`)
                var rows = table.find('tr').toArray().sort(comparer($(this).index()));
                this.asc = !this.asc;
                if (!this.asc) {
                    rows = rows.reverse()
                }
                for (var i = 0; i < rows.length; i++) {
                    table.append(rows[i])
                }
            });

            function comparer(index) {
                return function (a, b) {
                    var valA = getCellValue(a, index), valB = getCellValue(b, index)
                    return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
                }
            }

            function getCellValue(row, index) {
                return $(row).children('td').eq(index).text()
            }
        },

        clickRefreshSheetTable: function (qlobal, currSheetId, layout) {
            // Handler for refresh-sheetlist
            $(`#qfr-refresh-sheets`).click(async function () {
                await functions.getObjectSheetList(layout, qlobal);
                functions.getHtmlSheetList(qlobal, currSheetId);
                functions.setVisibilityTableRows(
                    $('#qfr-show-all').prop('checked'),
                    $('#qfr-show-warnings').prop('checked'),
                    $('#qfr-show-own').prop('checked')
                );
                // $('.qfr-col-rank.qfr-th-sort').click() // trigger sort by rank
            });
        },

        clickTooltip1Close: function () {
            // handle Close tooltip if user clicked on X symbol.
            $(`.qfr-tooltip1 .lui-icon--close`).click((elem) => {
                $(`.qfr-tooltip1-menu`).show();
                $(`.qfr-tooltip1-confirm`).hide();
                $(`.qfr-tooltip1`).hide();
            });
        },

        clickTooltip2Close: function () {
            $(`.qfr-tooltip2 .lui-icon--close`).click((elem) => {
                $(`.qfr-tooltip2`).hide();
            });
        },

        clickGoToSheet: function (qlobal) {
            // handler for go-to sheet icon in tooltip1
            $(`.qfr-tooltip1 .lui-icon--forward`).click((elem) => {
                const targetSheet = other.getSheetIdOfElem(elem);
                qlik.navigation.gotoSheet(targetSheet);
                functions.setVisibilityActionButtons(qlobal, targetSheet);
                $('.qfr-currSheetMarker').hide();
                $(`[sheet="${targetSheet}"] .qfr-currSheetMarker`).show();
                $(`.qfr-tooltip1`).hide();
            });
        },

        clickDeleteIcon: function () {
            // handler for delete sheet icon (bin icon) in tooltip1
            $(`.qfr-tooltip1 .lui-icon--bin`).click((elem) => {
                $(`.qfr-tooltip1-menu`).hide();
                $(`.qfr-tooltip1-confirm`).show();
            });
        },

        clickDeleteYes: function (app, qlobal) {
            // handle click on delete-yes button, finally delete object
            $('.qfr-del-sheet-now').click(async function (elem) {
                const sheetId = $(elem.target).parents('tr').attr('sheet');
                const tag = $(elem.target).parents('tr').attr('tag');
                if (tag == 'public') await other.unpublishSheet(sheetId, qlobal);
                const enigma = app.model.enigmaModel;
                enigma.destroyObject(sheetId);
                $(`.qfr-tooltip1-menu`).show();
                $(`.qfr-tooltip1-confirm`).hide();
                $(`.qfr-tooltip1`).hide();
                $(`#qfr-refresh-sheets`).click();
            });
        },

        clickFilterCheckbox1: function () {
            // handler for 3 filter checkboxes (1/3)
            $('#qfr-show-all').click((elem) => {
                if (elem.target.checked) {
                    // uncheck the other 2 checkboxes
                    $('#qfr-show-warnings').prop('checked', false);
                    $('#qfr-show-own').prop('checked', false);
                    functions.setVisibilityTableRows(true, false, false);
                } else {
                    $('#qfr-show-warnings').prop('checked', true);
                    $('#qfr-show-own').prop('checked', true);
                    functions.setVisibilityTableRows(false, true, true);
                }
            });
        },

        clickFilterCheckbox2: function () {
            // handler for filter checkboxes (2/3)
            $('#qfr-show-warnings').click((elem) => {
                if (elem.target.checked) {
                    $('#qfr-show-all').prop('checked', false);
                    // $('#qfr-show-own').prop('checked', false);
                    functions.setVisibilityTableRows(false, true, $('#qfr-show-own').prop('checked'));
                } else {
                    functions.setVisibilityTableRows(false, false, $('#qfr-show-own').prop('checked'));
                }
            });
        },

        clickFilterCheckbox3: function () {
            // handler for 3 filter checkboxes (3/3)
            $('#qfr-show-own').click((elem) => {
                if (elem.target.checked) {
                    $('#qfr-show-all').prop('checked', false);
                    // $('#qfr-show-own').prop('checked', false);
                    functions.setVisibilityTableRows(false, $('#qfr-show-warnings').prop('checked'), true);
                } else {
                    functions.setVisibilityTableRows(false, $('#qfr-show-warnings').prop('checked'), false);
                }
            });
        },

        clickCloseDialog: function () {
            // Handle for "X" button
            $('.qfr-close-msg').click(() => {
                $('#msg_parent_qfr-main').remove();
            });
        }
    };

    const apiCtrl = {

        getQlobalInfo: function (qlobal, ownId, layout) {
            // gets info about app and stores it into qlobal.appInfo, qlobal.userInfo
            // qlobal.ownerInfo, qlobal.spaceInfo, and qlobal.childApps
            console.log('Getting info about user, app, and space.');
            return new Promise((resolve, reject) => {

                const app = qlik.currApp();
                var httpHeaders = apiCtrl.getCloudHttpHeaders();

                $.ajax({
                    url: `/api/v1/users/me`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) { qlobal.userInfo = res; },
                    error: function (err) {
                        other.showApiError(err); reject(err);
                    }
                });

                $.ajax({
                    url: `/api/v1/apps/${app.id}`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) { qlobal.appInfo = res; },
                    error: function (err) {
                        other.showApiError(err); reject(err);
                    }
                });

                $.ajax({
                    url: `/api/v1/items?name=${app.model.layout.qTitle}`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) {
                        // qlobal.appInfo = res;
                        var thisApp = res.data.filter(e => e.resourceAttributes.id == app.id);
                        qlobal.itemInfo = thisApp[0];
                    },
                    error: function (err) {
                        other.showApiError(err); reject(err);
                    }
                });
                // console.log('this app', getHtmlAppInfo);

                $.ajax({
                    url: `/api/v1/users/${qlobal.appInfo.attributes.ownerId}`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) { qlobal.ownerInfo = res; },
                    error: function (err) {
                        other.showApiError(err); reject(err);
                    }
                });
                // console.log('Owner of app', ownerInfo);

                if (qlobal.appInfo.attributes.spaceId) {
                    $.ajax({
                        url: `/api/v1/spaces/${qlobal.appInfo.attributes.spaceId}`,
                        dataType: 'json',
                        method: 'GET',
                        headers: httpHeaders,
                        async: false,  // wait for this call to finish.
                        success: function (res) { qlobal.spaceInfo = res; },
                        error: function (err) {
                            other.showApiError(err); reject(err);
                        }
                    })
                } else {
                    qlobal.spaceInfo = null;
                }

                qlobal.childApps = [];
                var loop = 0;
                var url = `/api/v1/items?resourceType=app&limit=99`;
                var errorQuit = false
                while (url && !errorQuit) {
                    loop++;
                    $.ajax({
                        url: url,
                        dataType: 'json',
                        method: 'GET',
                        headers: httpHeaders,
                        async: false,  // wait for this call to finish.
                        success: function (res) {
                            const filteredApps = res.data.filter(e => {
                                return e.resourceAttributes ? (e.resourceAttributes.originAppId == app.id) : false
                            });
                            qlobal.childApps.push(...filteredApps);
                            url = res.links.next ? res.links.next.href : false;
                        },
                        error: function (err) {
                            console.error(err);
                            errorQuit = true;
                        }
                    })
                }

                var loop2 = 0;
                var url2 = `/api/v1/reloads?&appId=${app.id}&limit=99`;
                var errorQuit2 = false
                while (url2 && !errorQuit2) {
                    loop2++;
                    $.ajax({
                        url: url2,
                        dataType: 'json',
                        method: 'GET',
                        headers: httpHeaders,
                        async: false,  // wait for this call to finish.
                        success: function (res) {
                            // find
                            const incompleteReloads = res.data.filter(e => {
                                return ['QUEUED', 'RELOADING'].indexOf(e.status) > -1
                            })
                            if (incompleteReloads.length > 0) {
                                qlobal.ongoingReload = incompleteReloads[0];
                                other.updateButtonStatus(ownId, incompleteReloads[0].status, qlobal, layout);
                                url2 = false
                            } else {
                                url2 = res.links.next ? res.links.next.href : false;
                            }
                        },
                        error: function (err) {
                            console.error(err);
                            errorQuit2 = true;
                        }
                    })
                }

                console.log('qloudfriend qlobal updated', qlobal);
                resolve(true);
            })
        },

        reloadApp: function (ownId, app, qlobal) {
            // apiCtrl.reloadApp
            // Qlik Cloud API call
            console.log(ownId, 'Reload Button clicked.');
            var httpHeaders = apiCtrl.getCloudHttpHeaders();

            $.ajax({
                url: '/api/v1/reloads',
                // dataType: 'json',
                method: 'POST',
                contentType: "application/json",
                headers: httpHeaders,
                data: JSON.stringify({ appId: app.id }),
                async: false,  // wait for this call to finish.
                success: function (data) {
                    console.log(data);
                    qlobal.ongoingReload = data;
                    leonardo.msg('qfr-success', 'Success',
                        `<div class="lui-text-success" style="float:left;margin-right:8px;">
                            <span class="lui-icon  lui-icon--large  lui-icon--tick"></span>
                        </div>
                        <div class="lui-text">
                            ${qlobal.texts.reloadTriggeredInfo}
                            <a href="/item/${qlobal.itemInfo.id}/history" target="_blank">
                                ${qlobal.texts.reloadTriggeredLink}
                            </a>
                        </div>`
                        , null, 'Close', null);
                },
                error: function (err) {
                    other.showApiError(err);
                }
            });
        },

        changeAppOwner: function (qlobal) {
            // apiCtrl.changeAppOwner

            var httpHeaders = apiCtrl.getCloudHttpHeaders();

            $.ajax({
                url: `/api/v1/apps/${qlobal.appInfo.attributes.id}/owner`,
                // dataType: 'json',
                method: 'PUT',
                contentType: "application/json",
                headers: httpHeaders,
                data: JSON.stringify({ ownerId: qlobal.userInfo.id }),
                async: false,  // wait for this call to finish.
                success: function (data) {
                    console.log(data);
                    qlobal.ownerInfo = JSON.parse(JSON.stringify(qlobal.userInfo));
                    leonardo.msg('qfr-success', 'Success',
                        `<div class="lui-text-success" style="float:left;margin-right:8px;">
                            <span class="lui-icon  lui-icon--large  lui-icon--tick"></span>
                        </div>
                        <div class="lui-text">
                            ${qlobal.texts.appOwnerChanged}
                            <a href="${location.href.replace('/sense/app', '/dataloadeditor/app')}">Script Editor</a>
                        </div>`
                        , null, 'Close', null);
                },
                error: function (err) {
                    other.showApiError(err);
                }
            });
        },

        publishApp: function (app, qlobal, htmlSpaceIconManaged) {

            var httpHeaders = apiCtrl.getCloudHttpHeaders();
            $(`.qfr-tbody-applist`).empty();

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

                $(`.qfr-tbody-applist`).append(
                    `<tr>
                        <td style="vertical-align:bottom;">${htmlSpaceIconManaged}</td>
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
                            // change the app title back to what it was before ... 
                            $.ajax({
                                url: `/api/v1/apps/${childApp.resourceId}`,
                                // dataType: 'json',
                                method: 'PUT',
                                contentType: "application/json",
                                headers: httpHeaders,
                                data: JSON.stringify({
                                    attributes: { name: childApp.name }
                                }),
                                async: false,  // wait for this call to finish.
                                success: function (res) {
                                    leonardo.msg('qfr-main', qlobal.title,
                                        `<div class="lui-text-success">
                                       <span class="lui-icon  lui-icon--large  lui-icon--tick"></span>
                                       Success
                                   </div>
                                   <div><a href="/sense/app/${childApp.resourceId}" target="_blank">${childApp.name}</a> 
                                       ${qlobal.texts.appUpdated.replace('{{space}}', space.name)}
                                   </div>`,
                                        null, 'Close');
                                },
                                error: function (err) {
                                    other.showApiError(err);
                                }
                            });
                        },
                        error: function (err) {
                            other.showApiError(err);
                        }
                    });
                })
            }
        },

        getCsrfToken: function () {
            var csrfToken = document.cookie.split(';').filter(e => e.indexOf('_csrfToken=') > -1)[0] || '';
            if (csrfToken) {
                csrfToken = csrfToken.split('=')[1];
                // console.log('csrfToken', csrfToken);
            } else {
                csrfToken = "";
                console.warning('no _csrfToken found within Qlik Cloud cookies.');
            }
            return csrfToken
        },

        getCloudHttpHeaders: function () {
            var csrfToken = apiCtrl.getCsrfToken();
            if (csrfToken) {
                return { "qlik-csrf-token": csrfToken }
            } else {
                return {}
            }
        },

        rememberSessionInLocalStore: function (appId) {
            // remember the current user session (curr CSRF token) in the local storage 
            // entry 'qloudfriend' (an object with appId as key and CSRF session as value)
            var storeObj = {}
            if (localStorage.getItem('qloudfriend')) {
                try {
                    storeObj = JSON.parse(localStorage.getItem('qloudfriend'));
                }
                catch (err) {
                }
            }
            storeObj[appId] = apiCtrl.getCsrfToken();
            localStorage.setItem('qloudfriend', JSON.stringify(storeObj));
        },

        isSessionInLocalStore: function (appId) {
            // find out if the current user session (curr CSRF token) is remembered in the local
            // storage entry 'qloudfriend' (an object with appId as key and CSRF session as value)
            var ret = false;
            var stor = localStorage.getItem('qloudfriend');
            if (stor) {
                try {
                    stor = JSON.parse(stor);
                    ret = (stor[appId] == apiCtrl.getCsrfToken());
                }
                catch (err) {
                }
            }
            return ret
        }
    }

    const other = {
        getSheetIdOfElem: function (elem) {
            return $(elem.target).parents('tr').attr('sheet');
        },

        publishSheet: async function (whichSheet, qlobal, analysisMode = false) {
            console.log('other.publishSheet', whichSheet);
            const app = qlik.currApp();
            const enigma = app.model.enigmaModel;
            const sheetId = whichSheet || qlik.navigation.getCurrentSheetId().sheetId;
            const sheetObj = await enigma.getObject(sheetId);
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
                    `${qlobal.texts.errPublishSheet}: ${JSON.stringify(err)}`
                    , null, 'Close', null, true);
                ret = false;
            }
            const sheetObjProp = sheetObj.getProperties();
            console.log('Sheet published', sheetObjProp);
            return ret;
        },

        unpublishSheet: async function (whichSheet, qlobal, editMode = false) {
            console.log('other.unpublishSheet', whichSheet);
            const app = qlik.currApp();
            const enigma = app.model.enigmaModel;
            const sheetId = whichSheet || qlik.navigation.getCurrentSheetId().sheetId;
            const sheetObj = await enigma.getObject(sheetId)
            var ret = true;
            try {
                await sheetObj.unPublish();
                qlobal.sheetInfo[whichSheet].published = false;
            }
            catch (err) {
                leonardo.msg('qfr-error', 'Error',
                    `${qlobal.texts.errUnpublishSheet}: ${JSON.stringify(err)}`
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
        },


        setSheetTag: async function (sheetId, tag, qlobal) {
            // function sets a new property "qloudfriendTag" into the sheet object
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
        },

        showApiError: function (err) {
            console.error(err);
            leonardo.msg('qfr-error', `Error ${err.status}`,
                `<div>
            ${err.responseJSON ?
                    (err.responseJSON.errors ? JSON.stringify(err.responseJSON.errors[0]) : err.responseText)
                    : err.statusText
                }
            </div>`
                , null, 'Close', null, true);
        },

        updateButtonStatus: function (ownId, status, qlobal, layout) {
            const resetAfterMs = 10500;
            const needsToChange = status != $(`#reload_${ownId}`).data('mode');
            if (status == 'ready' && needsToChange) {
                $(`#reload_${ownId}`)
                    .html(layout.pLabelReloadBtn)
                    .prop('title', qlobal.texts.reloadMsg['ready'])
                    .data('mode', status)
                    .prop('disabled', false);

            } else if (status == 'QUEUED' && needsToChange) {
                $(`#reload_${ownId}`)
                    .html('<img src="../extensions/db-ext-qloudfriend/pics/hourglass.gif" />')
                    .prop('title', qlobal.texts.reloadMsg[status])
                    .data('mode', status)
                    .prop('disabled', true);

            } else if (status == 'RELOADING' && needsToChange) {
                $(`#reload_${ownId}`)
                    .html('<span class="lui-icon  lui-icon--reload"></span>')
                    .prop('title', qlobal.texts.reloadMsg[status])
                    .data('mode', status)
                    .prop('disabled', true);

            } else if (status == 'FAILED' && needsToChange) {
                qlobal.ongoingReload = null;
                $(`#reload_${ownId}`)
                    .html('<span class="lui-icon  lui-icon--warning-triangle"></span>')
                    .prop('title', qlobal.texts.reloadMsg[status])
                    .data('mode', status)
                    .prop('disabled', true);
                qlobal.resetAfter = Date.now() + resetAfterMs;

            } else if (status == 'SUCCEEDED' && needsToChange) {
                qlobal.ongoingReload = null;
                $(`#reload_${ownId}`)
                    .html('<span class="lui-icon  lui-icon--tick"></span>')
                    .prop('title', qlobal.texts.reloadMsg[status])
                    .data('mode', status)
                    .prop('disabled', true);
                qlobal.resetAfter = Date.now() + resetAfterMs;

            } else if (status == 'CANCELED' && needsToChange) {
                qlobal.ongoingReload = null;
                $(`#reload_${ownId}`)
                    .html('<span class="lui-icon  lui-icon--close"></span>')
                    .prop('title', qlobal.texts.reloadMsg[status])
                    .data('mode', status)
                    .prop('disabled', true);
                qlobal.resetAfter = Date.now() + resetAfterMs;

            } else if (status == 'error' && needsToChange) {
                qlobal.ongoingReload = null;
                $(`#reload_${ownId}`)
                    .html('Error')
                    .prop('title', qlobal.texts.reloadMsg[status])
                    .data('mode', status)
                    .prop('disabled', true);
                qlobal.resetAfter = Date.now() + resetAfterMs;

            } else if (needsToChange) {
                const warn = qlobal.texts.reloadMsg.unknown.replace('{{status}}', status);
                console.warn(warn);
                qlobal.ongoingReload = null;
                $(`#reload_${ownId}`)
                    .html('?')
                    .prop('title', warn)
                    .data('mode', '?')
                    .prop('disabled', true);
                qlobal.resetAfter = Date.now() + resetAfterMs;

            }
        }
    }

    return {

        open: async function (layout, qlobal) {

            // console.log('friendButton clicked', qlobal);
            const ownId = layout.qInfo.qId;

            const app = qlik.currApp();
            var currSheetId = qlik.navigation.getCurrentSheetId().sheetId;

            const html = windowHtml
                // .replace(new RegExp('{{ownId}}', 'g'), ownId)
                .replace(new RegExp('{{spaceInfo}}', 'g'), functions.getHtmlAppInfo(qlobal))
                .replace(new RegExp('{{texts.sourceData}}', 'g'), texts.sourceData)
                .replace(new RegExp('{{texts.targetData}}', 'g'), texts.targetData)

            // Render the main window
            leonardo.msg('qfr-main', qlobal.title + closeAndHelpButtons, html,
                null, /*'Cancel'*/ null, null, null, dialogStyle
            );

            await functions.getObjectSheetList(layout, qlobal);

            $('.qfr-rotate').hide();
            $('#qfr-sheetlist-section').show();

            functions.getHtmlSheetList(qlobal, currSheetId);

            // show the right rows (initial filter settings)
            functions.setVisibilityTableRows(false, true, true);

            // register all necessary click-handlers
            events.clickRefreshSheetTable(qlobal, currSheetId, layout);
            events.clickFilterCheckbox1();
            events.clickFilterCheckbox2();
            events.clickFilterCheckbox3();
            events.clickTableHeaderSort();
            $('.qfr-col-rank.qfr-th-sort').click() // trigger sort by rank
            events.clickCloseDialog();

            // Add "publish app" action button
            if (qlobal.childApps.length > 0) {
                $("#qfr-btn-publish-app").remove();
                $(`#msg_parent_qfr-main .lui-dialog__footer`).append(
                    `<button class="lui-button" id="qfr-btn-publish-app">
                    <span class="lui-icon  lui-icon--map"></span>
                    <br/>Republish App
                    </button>`
                );
                events.clickButtonPublishApp(qlobal, app, functions.getHtmlSpaceIcon('managed'));
            }


            // Add Reload button
            if (layout.pUseReloadBtn) {
                $("#qfr-btn-reload2").remove();
                $(`#msg_parent_qfr-main .lui-dialog__footer`).append(
                    `<button class="lui-button" id="qfr-btn-reload2">
                        <span class="lui-icon  lui-icon--reload"></span>
                        <br/>Reload App
                    </button>`
                );
                events.clickButtonReload(ownId, app, qlobal);
            }

            // Add "Make me owner"
            if (qlobal.userInfo.id != qlobal.ownerInfo.id) {
                $("#qfr-btn-chgowner").remove();
                $(`#msg_parent_qfr-main .lui-dialog__footer`).append(
                    `<button class="lui-button" id="qfr-btn-chgowner">
                        <span class="lui-icon  lui-icon--person"></span>
                        <br/>Take Ownership
                    </button>`
                );
                events.clickButtonChgOwner(qlobal);
            }
            // Add Unpublish Sheet button
            $("#qfr-btn-unpublish-sheet").remove();
            $(`#msg_parent_qfr-main .lui-dialog__footer`).append(
                `<button class="lui-button" id="qfr-btn-unpublish-sheet" style="display:none;">
                    <span class="lui-icon  lui-icon--export"></span> 
                    <br/>Checkout Sheet
                </button>`
            );
            events.clickButtonUnpublishSheet(qlobal, currSheetId);

            // Add Publish Sheet button
            $("#qfr-btn-publish-sheet").remove();
            $(`#msg_parent_qfr-main .lui-dialog__footer`).append(
                `<button class="lui-button" id="qfr-btn-publish-sheet" style="display:none;">
                    <span class="lui-icon  lui-icon--upload"></span>
                    <br/>Publish Sheet
                </button>`
            );
            events.clickButtonPublishSheet(qlobal, currSheetId);
            events.clickButtonBackToList(qlobal, currSheetId);

            functions.setVisibilityActionButtons(qlobal, currSheetId);

        },

        apiCtrl: apiCtrl,

        functions: functions,

        other: other,

        intervalHandler: function (ownId, layout, qlobal) {
            // console.log('qloudfriend interval ' + ownId, new Date());
            if (Date.now() > qlobal.resetAfter && !qlobal.ongoingReload) {
                other.updateButtonStatus(ownId, 'ready', qlobal, layout);
            }
            if (qlobal.ongoingReload) {
                //console.log('ongoing Reload', qlobal.ongoingReload)
                $.ajax({
                    url: '/api/v1/reloads/' + qlobal.ongoingReload.id,
                    //     // dataType: 'json',
                    method: 'GET',
                    //     contentType: "application/json",
                    headers: apiCtrl.getCloudHttpHeaders(),
                    async: false,  // wait for this call to finish.
                    success: function (res) {
                        // console.log(res.status);
                        qlobal.ongoingReload = res;
                        other.updateButtonStatus(ownId, res.status, qlobal, layout)
                    },
                    error: function (err) {
                        console.error(err);
                        other.updateButtonStatus(ownId, 'error', qlobal, layout)
                    }
                });
            }

        }
    }

});
