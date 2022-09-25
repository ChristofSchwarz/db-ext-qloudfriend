// Button 1 Click Handler

define(["qlik", "jquery"], function (qlik, $) {

    return {
        click: function (ownId, appId) {
            console.log(ownId, 'Button 1 clicked.');
            $.ajax({
                url: '/api/v1/reloads',
                dataType: 'json',
                method: 'POST',
                contentType: "application/json",
                headers: {
                    // "Authorization": "Bearer " + layout.pApiKey
                },
                data: { appId: appId },
                async: false,  // wait for this call to finish.
                success: function (data) {
                    console.log(data)
                }
            })
        }
    }

});
