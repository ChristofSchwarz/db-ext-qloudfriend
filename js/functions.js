// common functions needed in qloudFriend extension ...

define(["qlik", "jquery", "./leonardo"], function
    (qlik, $, leonardo) {

    return {

        getCloudHttpHeaders: function () {
            return getCloudHttpHeaders();
        },

        getSpaceIcon: function (type, tag = 'span') {
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

        showApiError: function (err) {
            showApiError(err)
        },

        getQlobalInfo: function (qlobal) {
            // gets info about app and stores it into qlobal.appInfo, qlobal.userInfo
            // qlobal.ownerInfo, qlobal.spaceInfo, and qlobal.childApps
            console.log('Getting info about user, app, and space.');
            return new Promise((resolve, reject) => {

                const app = qlik.currApp();
                var httpHeaders = getCloudHttpHeaders();

                $.ajax({
                    url: `/api/v1/users/me`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) { qlobal.userInfo = res; },
                    error: function (err) { showApiError(err); reject(err); }
                });

                $.ajax({
                    url: `/api/v1/apps/${app.id}`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) { qlobal.appInfo = res; },
                    error: function (err) { showApiError(err); reject(err); }
                });
                // console.log('this app', appInfo);

                $.ajax({
                    url: `/api/v1/users/${qlobal.appInfo.attributes.ownerId}`,
                    dataType: 'json',
                    method: 'GET',
                    headers: httpHeaders,
                    async: false,  // wait for this call to finish.
                    success: function (res) { qlobal.ownerInfo = res; },
                    error: function (err) { showApiError(err); reject(err); }
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
                        error: function (err) { showApiError(err); reject(err); }
                    })
                } else {
                    qlobal.spaceInfo = null;
                }

                qlobal.childApps = [];
                var loop = 0;
                var url = `/api/v1/items?resourceType=app&limit=99`;
                while (url) {
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
                        }
                    })
                }

                console.log('qlobal updated', qlobal);
                resolve(true);
            })
        }

    };

    function getCloudHttpHeaders() {
        var csrfToken = document.cookie.split(';').filter(e => e.indexOf('_csrfToken=') > -1)[0] || '';
        // console.log('csrfToken', csrfToken);
        var httpHeaders = {};
        if (csrfToken) {
            csrfToken = csrfToken.split('=')[1];
            httpHeaders["qlik-csrf-token"] = csrfToken;
        } else {
            console.warning('no _csrfToken found within Qlik Cloud cookies.');
        }
        return httpHeaders;
    }

    function showApiError(err) {
        console.error(err);
        leonardo.msg('qfr-error', `<span class="lui-icon  lui-icon--warning"></span> Error ${err.status}`,
            `<div>
            ${err.responseJSON ?
                (error.responseJSON.errors ? JSON.stringify(err.responseJSON.errors[0]) : err.responseText)
                : err.statusText
            }
        </div>`
            , null, 'Close', null, true);
    }
});
