// properties (accordion panel) db-ext-qloudFriend.js ...

define(["qlik", "jquery", "./leonardo"], function (qlik, $, leonardo) {

    return {

        items: function (qext) {
            var app = qlik.currApp();
            var enigma = app.model.enigmaModel;
            return [
                {
                    uses: "settings"
                },
                // {
                //     uses: "addons",
                //     items: [
                //         {
                //             uses: "dataHandling",
                //             items: [
                //                 { uses: "calcCond" }
                //             ]
                //         }
                //     ]
                // },
                {
                    label: 'Extension Settings',
                    type: 'items',
                    component: 'expandable-items',
                    items: [
                        accordion_apikey(enigma),
                        accordion_button1(),
                        accordion_presentation()
                    ]
                }, {
                    label: 'About this extension',
                    type: 'items',
                    items: about(qext)
                }
            ]
        }
    }

    function accordion_apikey(enigma) {
        return {
            label: 'API Key',
            type: 'items',
            items: [{
                label: 'API Key',
                type: 'string',
                expression: 'optional',
                ref: 'pApiKey',
                defaultValue: 'eyJhbGciOiJFUzM4NCIsImtpZCI6IjA5NWVlNWIyLTBhNGUtNDdkOS1iZDI0LWRmNTRkYzdkNWU0ZSIsInR5cCI6IkpXVCJ9'
                    + '.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoiREU4UmkwRE0zb0dLa01rTHhKUGcyenV5UHhTdWpteEYiLCJqdGkiOiIwOTVlZTViMi0'
                    + 'wYTRlLTQ3ZDktYmQyNC1kZjU0ZGM3ZDVlNGUiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiNjJ'
                    + 'jZWMwMTkxNjBhNmFmMDMzN2YyOGRhIn0.lwZc7AUBZOEUXxqJ9XJ8mKh5d0Z3eyT88hrjguIjzP4l2ciVMEnA87VF5g5dvWQbZj8sJF-Y_ro'
                    + 'vEvbtjFibhFikVhNAlvCy_pvZc5ZX_mC13UV_W5Z1PZpc1FsncQ9m'
            }, {
                label: 'Test API Key',
                component: 'button',
                action: async function (arg) {
                    var apiKey
                    if (arg.pApiKey.qStringExpression) {
                        // console.log('evaluate', arg.pApiKey.qStringExpression.qExpr);
                        apiKey = await enigma.evaluate(arg.pApiKey.qStringExpression.qExpr);
                    } else {
                        // console.log('apiKey', arg.pApiKey);
                        apiKey = arg.pApiKey;
                    };
                    $.ajax({
                        url: '/api/v1/users/me',
                        method: 'GET',
                        headers: {
                            "Authorization": "Bearer " + arg.pApiKey
                        },
                        dataType: 'json',
                        async: false,  // wait for this call to finish.
                        success: function (data) {
                            leonardo.msg(arg.qInfo.qId, "Info", apiKey + '<br/><br/>' + JSON.stringify(data), null, 'Close');
                            console.log(data);
                        }
                    })
                }
            }]
        }
    }
    /*
                        ,
    */
    function accordion_button1() {   // ---------- reload ----------
        return {
            label: 'Button Reload',
            type: 'items',
            items: [{
                type: "boolean",
                defaultValue: true,
                ref: "pUseBtn1",
                label: "Use Button"
            }, {
                label: 'Button Label',
                type: 'string',
                expression: 'optional',
                ref: 'pBtnLabel1',
                defaultValue: 'Reload',
                show: function (data) { return data.pUseBtn1 }
            }, /*{
                type: "boolean",
                component: "switch",
                label: "Reload Task",
                ref: "pReloadOwn",
                options: [{
                    value: true,
                    label: "Reload this app"
                }, {
                    value: false,
                    label: "Specific app (specify task)"
                }],
                defaultValue: true,
                show: function (data) { return data.pUseBtn1 }
            }, {
                label: 'Task ID to trigger',
                type: 'string',
                ref: 'pTaskId',
                expression: 'optional',
                show: function (data) { return data.pUseBtn1 && !data.pReloadOwn }
            },*/ {
                label: 'Hide within published apps',
                type: 'boolean',
                ref: 'pCBhideIfPublic',
                defaultValue: false,
                show: function (data) { return data.pUseBtn1 }
            }, {
                label: 'Conditional Show',
                type: 'boolean',
                ref: 'pCBshowIfFormula',
                defaultValue: false,
                show: function (data) { return data.pUseBtn1 }
            }, {
                label: 'Only show if the follwing is true:',
                type: 'string',
                component: 'textarea',
                rows: 4,
                expression: 'optional',
                ref: 'pShowCondition',
                defaultValue: "=WildMatch(OSUser(), '*QMI-QS-SN*vagrant', '...')\n" +
                    "//put a list of users in single quotes and use format '*DIRECTORY*userid' including the asterisks",
                show: function (data) { return data.pUseBtn1 && data.pCBshowIfFormula }
            }, {
                label: "Text color",
                component: "color-picker",
                ref: "pTxtColor1",
                type: "object",
                //dualOutput: true,
                defaultValue: "#333333",
                show: function (data) { return data.pUseBtn1 }
            }, {
                label: "Background color",
                component: "color-picker",
                ref: "pBgColor1",
                type: "object",
                defaultValue: "#ffffff",
                show: function (data) { return data.pUseBtn1 }
            }]
        }
    }

    function accordion_presentation() {
        return {
            label: 'Presentation',
            type: 'items',
            items: [
                /*{
                    label: 'Button width',
                    type: 'integer',
                    ref: 'pBtnWidth',
                    component: 'slider',
                    min: 10,
                    max: 99,
                    step: 1,
                    defaultValue: 95
                },*/
                {
                    type: "number",
                    component: "dropdown",
                    label: "Button Width",
                    ref: "pBtnWidth2",
                    options: [
                        { value: 100, label: "1 per row" },
                        { value: 100 / 2, label: "2 per row" },
                        { value: 100 / 3, label: "3 per row" },
                        { value: 100 / 4, label: "4 per row" },
                        { value: 100 / 5, label: "5 per row" },
                        { value: 100 / 6, label: "6 per row" }
                    ],
                }, {
                    type: "string",
                    component: "dropdown",
                    label: "Show in the buttons",
                    ref: "pIconTxt",
                    defaultValue: "it",
                    options: [
                        { value: "t", label: "Text" },
                        { value: "i", label: "Icon" },
                        { value: "it", label: "Icon and Text" }
                    ],
                }, {
                    type: "boolean",
                    defaultValue: false,
                    ref: "pNoBkgr",
                    label: "Turn off background"
                }]
        }
    }

    function about(qext) {
        return {
            version: {
                label: function (arg) { return 'Extension version ' + qext.version; },
                component: "link",
                url: '../extensions/db-ext-qloudfriend/db-ext-qloudfriend.qext'
            },
            txt1: {
                label: "This extension is free of charge by data/\\bridge, Qlik OEM partner and specialist for Mashup integrations.",
                component: "text"
            },
            txt2: {
                label: "Use as is. No support without a maintenance subscription.",
                component: "text"
            },
            dbLogo: {
                label: "",
                component: "text"
            },
            btn: {
                label: "About Us",
                component: "link",
                url: 'https://www.databridge.ch'
            } /*,
                docu: {
                    label: "Open Documentation",
                    component: "button",
                    action: function (arg) {
                        window.open('https://github.com/ChristofSchwarz/qs_ext_reloadreplace', '_blank');
                    }
                } */
        }
    }

});
