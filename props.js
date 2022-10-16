// properties (accordion panel) db-ext-qloudFriend.js ...

define(["qlik", "jquery", "./leonardo"], function (qlik, $, leonardo) {

    return {

        items: function (qext) {
            const app = qlik.currApp();
            const enigma = app.model.enigmaModel;
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
                        // accordion_apikey(enigma),
                        accordion_button1(),
                        // accordion_button2(),
                        // accordion_button3(),
                        // accordion_presentation()
                    ]
                }, {
                    label: 'About this extension',
                    type: 'items',
                    items: about(qext)
                }
            ]
        }
    }


    function accordion_button1() {   // ---------- reload ----------
        return {
            label: 'Button "Reload App"',
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
            }, {
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
            }*/]
        }
    }

    function accordion_button2() {   // ---------- publish sheet ----------
        return {
            label: 'Button 2) Sheet Checkout',
            type: 'items',
            items: [{
                type: "boolean",
                defaultValue: true,
                ref: "pUseBtn2",
                label: "Use Button"
            }, {
                label: 'Button Label Checkout',
                type: 'string',
                expression: 'optional',
                ref: 'pBtnLabel2_unpublish',
                defaultValue: 'Checkout Sheet',
                show: function (data) { return data.pUseBtn2 }
            }, {
                label: 'Button Label Check-in',
                type: 'string',
                expression: 'optional',
                ref: 'pBtnLabel2_publish',
                defaultValue: 'Publish Sheet',
                show: function (data) { return data.pUseBtn2 }
            }, {
                label: "Text color",
                component: "color-picker",
                ref: "pTxtColor2",
                type: "object",
                //dualOutput: true,
                defaultValue: "#333333",
                show: function (data) { return data.pUseBtn2 }
            }, {
                label: "Background color",
                component: "color-picker",
                ref: "pBgColor2",
                type: "object",
                defaultValue: "#ffffff",
                show: function (data) { return data.pUseBtn2 }
            }]
        }
    }

    function accordion_button3() {   // ---------- publish app ----------
        return {
            label: 'Button 3) Publish App',
            type: 'items',
            items: [{
                type: "boolean",
                defaultValue: true,
                ref: "pUseBtn3",
                label: "Use Button"
            }, {
                label: 'Button Label',
                type: 'string',
                expression: 'optional',
                ref: 'pBtnLabel3',
                defaultValue: 'Publish App',
                show: function (data) { return data.pUseBtn3 }
            }, {
                label: "Text color",
                component: "color-picker",
                ref: "pTxtColor3",
                type: "object",
                //dualOutput: true,
                defaultValue: "#333333",
                show: function (data) { return data.pUseBtn3 }
            }, {
                label: "Background color",
                component: "color-picker",
                ref: "pBgColor3",
                type: "object",
                defaultValue: "#ffffff",
                show: function (data) { return data.pUseBtn3 }
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
