// properties (accordion panel) db-ext-qloudFriend.js ...

define(["qlik", "jquery"], function
    (qlik, $) {

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
                        accordion_presentation(),
                        accordion_friendButton(),
                        accordion_reloadButton()
                    ]
                }, {
                    label: 'About this extension',
                    type: 'items',
                    items: about(qext)
                }
            ]
        }
    }


    function accordion_reloadButton() {   // ---------- reload Button ----------
        return {
            label: 'Reload Button',
            type: 'items',
            items: [{
                type: "boolean",
                defaultValue: true,
                ref: "pUseReloadBtn",
                label: "Use Button"
            }, {
                label: 'Button Label',
                type: 'string',
                expression: 'optional',
                ref: 'pLabelReloadBtn',
                defaultValue: 'Reload',
                show: function (arg) { return arg.pUseReloadBtn }
            }, {
                label: "Text color of button",
                component: "color-picker",
                ref: "pTxtColor1",
                type: "object",
                //dualOutput: true,
                defaultValue: "#222222",
                show: function (data) { return data.pUseReloadBtn }
            }, {
                label: "Background color of button",
                component: "color-picker",
                ref: "pBgColor1",
                type: "object",
                defaultValue: "#fefefe",
                show: function (data) { return data.pUseReloadBtn }
            }]
        }
    }

    function accordion_friendButton() {   // ---------- friend Button ----------
        return {
            label: 'qloudFriend Button',
            type: 'items',
            items: [{
                type: "boolean",
                defaultValue: true,
                ref: "pHideInManagedApps",
                label: "Hide in managed apps"
            }]
        }
    }

    function accordion_presentation() {
        return {
            label: 'Presentation',
            type: 'items',
            items: [
                {
                    label: 'Hide background and border.',
                    type: 'boolean',
                    ref: 'pHideBackground',
                    defaultValue: false
                }
            ]
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
