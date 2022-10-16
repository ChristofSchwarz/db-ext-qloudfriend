// Button 3 - Publish App

define(["qlik", "jquery", "../leonardo", "../functions"], function
    (qlik, $, leonardo, functions) {

    const texts = {
        sourceData: 'Copy data from this app to child app',
        targetData: 'Do not change data of child app'
    }

    return {
        click: function (ownId, layout) {

            const app = qlik.currApp();
            const currSheet = qlik.navigation.getCurrentSheetId();
            console.log(ownId, 'Button "Publish App" clicked.');
            $(`btn3_${ownId}`).prop('disabled', true);
            leonardo.msg(ownId, 'One moment ...',
                `<p style="text-align: center;">
                    <span class="lui-icon  lui-icon--reload  qloudFriend-spin" style="font-size: xxx-large;></span>
                </p>`,
                null, 'Close', null, null, 'width:640px;');

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

                leonardo.msg(ownId, 'Error', 'This app has no child apps yet.',
                    null, 'Close', null, null, 'width:640px;');
                $(`btn3_${ownId}`).removeAttr('disabled');

            } else {

                // Build a html table from childApps and lookup names of spaces and owners where needed

                leonardo.msg(ownId, 'Choose a child app to refesh',
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
                    <table>
                        <thead>
                            <tr>
                                <th>&nbsp;</th><th>Space</th><th>App Name</th><th>App Owner</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>`,
                    null, 'Close', null, null, 'width:640px;');

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

                    $(`#msg_parent_${ownId} tbody`).append(
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
                                leonardo.msg(ownId, 'Success',
                                    `<a href="/sense/app/${childApp.resourceId}" target="_blank">${childApp.name}</a> 
                                    in space &quot;${space.name}&quot; has been successfully republished.`,
                                    null, 'Close');
                            }
                        });
                    })
                }

                $(`btn3_${ownId}`).removeAttr('disabled');
            }

        }
    }

});
