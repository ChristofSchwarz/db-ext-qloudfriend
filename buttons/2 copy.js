// Button 1 Click Handler

define(["qlik", "jquery", "../leonardo", "../functions", "../node_modules/leonardo-ui/dist/leonardo-ui.min"], function
    (qlik, $, leonardo, functions, leonardoui) {

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

    const texts = {
        private: `<span class="lui-icon  lui-icon--warning-triangle"></span><span>&nbsp;This sheet is private.</span>`,
        published: '<span class="lui-icon  lui-icon--share"></span><span>&nbsp;This sheet is published</span>'
    }

    // const dialogStyle = 'right:0;top:0;left:unset;width:unset;';
    const dialogStyle = 'right:0;top:0;left:unset;width:440px;';

    function getSheetStatus(ownId, layout, qlobal) {
        return new Promise((resolve, reject) => {
            // const enigma = app.model.enigmaModel;
            const app = qlik.currApp();
            const currSheet = qlik.navigation.getCurrentSheetId().sheetId;
            var sheetInfo = {};
            // var suggestedAction = '?';

            app.getAppObjectList('sheet', function (reply) {

                for (const sheet of reply.qAppObjectList.qItems) {
                    // console.log('sheet', sheet);
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

    function publish(whichSheet) {
        const app = qlik.currApp();
        const enigma = app.model.enigmaModel;
        const currSheet = whichSheet || qlik.navigation.getCurrentSheetId().sheetId;
        enigma.getObject(currSheet)
            .then(sheetObj => {
                // console.log('sheetObj', sheetObj);
                if (!whichSheet) {
                    qlik.navigation.setMode('analysis');
                }
                sheetObj.publish();
                console.log('Sheet published');
            })
            .catch(err => {
                console.error(err);
            })
    }

    function unpublish(whichSheet) {
        const app = qlik.currApp();
        const enigma = app.model.enigmaModel;
        const currSheet = whichSheet || qlik.navigation.getCurrentSheetId().sheetId;
        enigma.getObject(currSheet)
            .then(sheetObj => {
                // console.log('sheetObj', sheetObj);
                sheetObj.unPublish().then(() => {
                    console.log('Sheet unpublished');
                    if (!whichSheet) {
                        setTimeout(function () {
                            qlik.navigation.setMode('edit');
                        }, 500);
                    }
                });
            })
            .catch(err => {
                console.error(err);
            })
    }


    return {
        getSheetStatus: function (ownId, layout, qlobal) {
            return new Promise((resolve, reject) => {
                getSheetStatus(ownId, layout, qlobal).then(res => resolve(res));
            })
        },

        publish: function () {
            publish();
        },

        unpublish: function () {
            unpublish();
        },

        toolbarButton: function (ownId, layout, qlobal) {

            const app = qlik.currApp();
            const currSheet = qlik.navigation.getCurrentSheetId().sheetId;
            var httpHeaders = functions.getCloudHttpHeaders();

            leonardo.msg('qloudFriend', 'One moment ...',
                `<div class="qloudFriend-rotate"><span class="lui-icon  lui-icon--large lui-icon--reload"></span></div>`,
                null, /*'Cancel'*/ null, null, null, dialogStyle
            );

            getSheetStatus(ownId, layout, qlobal).then(res => {

                var buttonText = '';
                if (res.action == 'unpublish') {
                    buttonText = layout.pBtnLabel2_unpublish
                } else if (res.action == 'publish') {
                    buttonText = layout.pBtnLabel2_publish
                }
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
                    'Qloud Friend Extension' + close_button,
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
                        <!--
                        <a id="qfr-show-all">all (<span id="qfr-all-counter"></span>)</a> &nbsp;
                        <a id="qfr-show-warnings">warnings (<span id="qfr-warnings-counter"></span>)</a> &nbsp;
                        <a id="qfr-show-own">current (1)</a> &nbsp;
                        -->
                    </div>` + sheetTable +
                    `<div id="qfr-spaceinfo">...</div>`,
                    buttonText, /*'Cancel'*/ null, null, null, dialogStyle
                );


                $('.qfr-close-msg').click(() => {
                    $('#msg_parent_qloudFriend').remove();
                });



                var sheetCount = 0;
                // var sheetWarningCount = 0;
                for (const sheet in qlobal.sheetInfo) {
                    sheetCount++;
                    const thisSheet = qlobal.sheetInfo[sheet];
                    console.log('sheet description', thisSheet.description);
                    var tag = '';
                    if (thisSheet.description.toLowerCase().indexOf('(private)') > -1 ||
                        thisSheet.description.toLowerCase().indexOf('(priv)') > -1) {
                        tag = 'private';
                    }
                    if (thisSheet.description.toLowerCase().indexOf('(public)') > -1 ||
                        thisSheet.description.toLowerCase().indexOf('(publ)') > -1) {
                        tag = 'public';
                    }

                    $(`#${ownId}-tbody`).append(`
                        <tr class="qfr_sheetTableRow" id="qfr_${sheet}">
                            <td>${sheet == currSheet ? '<span title="This is the current sheet" class="lui-icon  lui-icon--arrow-right"></span>' : '&nbsp;'}</td>
                            <td>${thisSheet.title}</td>
                            <td class="qfr-col-tag  qfr-tag-${tag}">${tagHtml(tag, sheet)}</td>
                            <td class="qfr-col-published">
                                <!--span class="qfr-cb-{bgIsRight}"-->
                                <span>
                                <input type="checkbox" id="qfr_publ_${sheet}" tag="${tag}"
                                    ${thisSheet.published == true ? ' checked' : ''}
                                    ${thisSheet.approved == true ? ' disabled' : ''}>
                                </span>
                            </td>
                            <td>
                                <input type="checkbox" disabled ${thisSheet.approved == true ? 'checked' : ''}>
                            </td>
                        </tr>`);

                    // if (setRightOrWrong(sheet, tag, thisSheet.published) == 'wrong') sheetWarningCount++;
                    setRightOrWrong(sheet, tag, thisSheet.published);

                    // Handle click on the tag column in that row
                    $(`#qfr_${sheet} .qfr-col-tag a`).click(() => {
                        $(`#${ownId}-tbody .lui-tooltip`).hide();
                        $(`#qfr_${sheet} .lui-tooltip`).show();
                    });

                    // Handle click on the "published" checkbox of that row
                    $(`#qfr_publ_${sheet}`).click((elem) => {
                        // $(elem.target).parent().removeClass("qfr-cb-wrong qfr-cb-right");
                        const tag = $(elem.target).attr('tag');
                        // correct the marker if right/wrong
                        if (elem.target.checked) {
                            publish(sheet);
                            // if (tag == 'public') {
                            //     $(elem.target).parent().addClass("qfr-cb-right");
                            //     $('#qfr-warnings-counter').text(parseInt($('#qfr-warnings-counter').text()) - 1);
                            // } else if (tag == 'private') {
                            //     $(elem.target).parent().addClass("qfr-cb-wrong");
                            //     $('#qfr-warnings-counter').text(parseInt($('#qfr-warnings-counter').text()) + 1);
                            // }
                        } else {
                            unpublish(sheet);
                            // if (tag == 'public') {
                            //     $(elem.target).parent().addClass("qfr-cb-wrong");
                            //     $('#qfr-warnings-counter').text(parseInt($('#qfr-warnings-counter').text()) + 1);
                            // } else if (tag == 'private') {
                            //     $(elem.target).parent().addClass("qfr-cb-right");
                            //     $('#qfr-warnings-counter').text(parseInt($('#qfr-warnings-counter').text()) - 1);
                            // }
                        }
                        setRightOrWrong(sheet, tag, elem.target.checked);
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
                // handle click when user clicks on "public" in tooltip
                // $(`.qfr-span-private`).click(async function (elem) {
                //     const sheetId = $(elem.target).parent().attr('sheet');
                //     if (await setSheetTag(sheetId, 'private')) {
                //         $(`.qfr-settag`).css('display', 'none');
                //         $(`#qfr_${sheetId} .qfr-col-tag`)
                //             .removeClass('qfr-tag-')
                //             .removeClass('qfr-tag-public')
                //             .addClass(`qfr-tag-private`)
                //             .find('a').html('private');
                //         setRightOrWrong(sheetId, tag, $(`#qfr_publ_${sheetId}`).is(':checked'));
                //     };
                // });


                // freeze the width
                $('.qloudFriend-dialog').css('width', ($('.qloudFriend-dialog').width() * 1.1) + 'px');

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
                $(`#msg_ok_qloudFriend`).click(function () {
                    if (res.action == 'unpublish') {
                        unpublish();
                    } else if (res.action == 'publish') {
                        publish();
                    }
                    $(`#msg_parent_qloudFriend`).remove();
                });

                var httpHeaders = functions.getCloudHttpHeaders();
                var appName;

                $.ajax({
                    url: `/api/v1/apps/${app.id}`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    // data: { appId: appId },
                    async: false,  // wait for this call to finish.
                    success: function (appInfo) {
                        console.log('this app', appInfo);
                        if (appInfo.attributes.spaceId) {
                            $.ajax({
                                url: `/api/v1/spaces/${appInfo.attributes.spaceId}`,
                                dataType: 'json',
                                method: 'GET',
                                headers: httpHeaders,
                                // data: { appId: appId },
                                async: false,  // wait for this call to finish.
                                success: function (spaceInfo) {
                                    console.log('this app', appInfo);
                                    if (appInfo.attributes.spaceId) {
                                        $("#qfr-spaceinfo").html(functions.getSpaceIcon(spaceInfo.type, 'div') +
                                            `<div>&nbsp;This app is in ${spaceInfo.type} space &quot;
                                                <a href="/explore/spaces/${spaceInfo.id}" target="_blank">${spaceInfo.name}</a>&quot;
                                            </div>`);
                                    }
                                }
                            })
                        } else {
                            $("#qfr-spaceinfo").html(functions.getSpaceIcon("personal", 'div')
                                + '<div>&nbsp;This app is in personal space.</div>');
                        }
                    }
                })
            })
        }
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

    function tagHtml(tag, sheet) {
        var ret = `<a>${tag || 'set'}</a>   
            <div sheet="${sheet}" class="lui-tooltip qfr-settag" style="display:none;">
                <span class="qfr-span-public">public</span>
                <span class="qfr-span-private">private</span>
                <span class="lui-icon  lui-icon--small  lui-icon--close"></span>
                <div class="lui-tooltip__arrow lui-tooltip__arrow--left"></div>
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
            await sheetObj.setProperties(sheetObjProp);
            ret = true
        }
        return ret;
    }
});
