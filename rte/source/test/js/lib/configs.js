var _cqRteConfigs = {
    "dflt": {
        "requiredCssPath": "rte.css"
    },
    "allFeatures": {
        "rtePlugins": {
            "edit": {
                "features": "*"
            },
            "findreplace": {
                "features": "*"
            },
            "format": {
                "features": "*"
            },
            "justify": {
                "features": "*"
            },
            "lists": {
                "features": "*"
            },
            "subsuperscript": {
                "features": "*"
            },
            "links": {
                "features": "*"
            },
            "paraformat": {
                "features": "*"
            },
            "styles": {
                "features": "*",
                "styles": [ {
                        "cssName": "sourcecode",
                        "text": "Sourcecode"
                    }, {
                        "cssName": "warning",
                        "text": "Warning"
                    }
                ]
            },
            "table": {
                "features": "*"
            },
            "misctools": {
                "features": "*"
            },
            "undo": {
                "features": "*"
            }
            // image & spellcheck plugins are pointless here, as they require a suitable
            // server backend/content finder context
        }
    },
    "oldTest": {
//        "defaultPasteMode": "browser",
        "name": "./test1",
        "stripHtmlTags": false,
        "cssStyles": [ {
                "cssName": "sourcecode",
                "text": "Sourcecode"
            }, {
                "cssName": "warning",
                "text": "Warning"
            }
        ],
        "externalStyleSheets": [
            "RichText/externalStyle.css"
        ],
        "enableEditTools": true,
        "allowBlank": false,
        "linkbrowseConfig": {
            "cssExternal": "externalLink",
            "cssInternal": "internalLink",
            "protocols": [
               "http://"
            ],
            /*
            "targetConfig": {
                "mode": "auto",
                "targetExternal": "_blank"
                "mode": "manual"
            },
            */
            "linkAttributes": [ {
                    "attribute": "title",
                    "xtype": "textfield",
                    "fieldLabel": "Title"
                }
            ]

        },
        "tabSize": 2,
        // "enableColors": true,
        "enableStyle": true,
        "enableParagraphFormat": true,
        "enableSourceEdit": true,
        "enableSubSuperScript": true,
        "enableSpecialChars": true,
        "rtePlugins": {
            /*
            "links": {
                "linkDialogConfig": {
                    "configVersion": 1,
                    "additionalFields": [ {
                            "item": {
                                "name": "title",
                                "xtype": "textfield",
                                "fieldLabel": "Title",
                                "anchor": CQ.themes.Dialog.ANCHOR
                            },
                            "insertBefore": "href",
                            "fromModel": function(obj, field) {
                                field.setValue(obj && obj.dom ? obj.dom.title : "");
                            },
                            "toModel": function(obj, field) {
                                if (!obj.attributes) {
                                    obj.attributes = { };
                                }
                                obj.attributes.title = field.getValue();
                            },
                            "validator": function(fieldValue) {
                                return (fieldValue.length > 0);
                            }
                        }
                    ],
                    "disabledDefaultFields": [ "targetBlank" ],
                    "dialogProperties": {
                        "height": 180
                    }
                }
            },
            */
            "table": {
                "features": "*",
                /*
                "tableStyles": [ {
                        "className": "table1",
                        "text": "Yellow table"
                    }, {
                        "cssName": "table2",
                        "text": "Green table"
                    }
                ],
                "cellStyles": {
                    "table1": "Yellow cell",
                    "table2": "Green cell"
                },
                */
                "tableStyles": {
                    "table1": "Yellow table",
                    "table2": "Green table",
                    "table3": "Blue table"
                },
                "cellStyles": [ {
                        "className": "table1",
                        "text": "Yellow cell"
                    }, {
                        "cssName": "table2",
                        "text": "Green cell"
                    }
                ] /*,
                "defaultValues": {
                    "tableTemplate": "<table><tr><td>Test</td><td>Template</td></tr><tr><td colspan='2'>ABCDEF</td></tr></table>"
                } */
            },
            "lists": {
                "features": "*",
                "indentSize": 20
            },
            "findreplace": {
                "features": "*"
            },
            "undo": {
                "features": "*"
            },
            "misctools": {
                "features": "*",
                "specialCharsConfig": {
                    "chars": {
                        "letters": {
                            "rangeStart": 65,
                            "rangeEnd": 90
                        },
                        "digits": {
                            "rangeStart": 48,
                            "rangeEnd": 57
                        },
                        "others": {
                            "rangeStart": 128,
                            "rangeEnd": 255
                        }
                    }
                }
            },
            "edit": {
                "features": "*",
                "htmlPasteRules": {
                    "allowBasics": {
                        "italic": true,
                        "anchor": true
                    },
                    "allowBlockTags": [
                        "p", "h1", "h2", "h3"
                    ],
                    "list": {
                        "allowed": false,
                        "ignoreMode": "paragraph"
                    },
                    "table": {
                        "allowed": true,
                        "ignoreMode": "paragraph"
                    },
                    "cssMode": "remove",
                    "allowedCssNames": [
                    ]
                }
            }
        },
        "htmlRules": {
            "links": {
                "cssExternal": "externalLink",
                "cssInternal": "internalLink",
                "protocols": [
                   "http://"
                ],
                "targetConfig": {
                    "mode": "auto",
                    "targetExternal": "_blank"
                }
            },
            "docType": {
                "baseType": "xhtml",
                "version": "1.0",
                "typeConfig": {
                    "useSemanticMarkup": true,
                    "isXhtmlStrict": true /*,
                    "semanticMarkupMap": {
                        "u": "cite"
                    }
                    */
                }
            },
            "serializer": {
                "config": {
                    "useShortTags": true
                }
            }
        },
        // "removeSingleParagraphContainer": true,
        "requiredCssPath": "rte.css"
    }
};