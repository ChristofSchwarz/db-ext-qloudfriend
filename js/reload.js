// Button 1 Click Handler

define(["qlik", "jquery", "./functions", "./leonardo"], function
    (qlik, $, functions, leonardo) {

    return {
        click: function (ownId, app) {

            console.log(ownId, 'Button 1 clicked.');
            var httpHeaders = functions.getCloudHttpHeaders();

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
                    leonardo.msg('qfr-success', 'Success',
                        `<div class="lui-text-success">
                            <span class="lui-icon  lui-icon--large  lui-icon--tick"></span>
                            Application reload triggered in the background.
                        </div>`
                        , null, 'Close', null);
                },
                error: function (err) {
                    functions.showApiError(err);
                }
            });
        }
    }

});
