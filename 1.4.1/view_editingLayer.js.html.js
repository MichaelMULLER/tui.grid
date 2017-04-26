tui.util.defineNamespace("fedoc.content", {});
fedoc.content["view_editingLayer.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Layer class that represents the state of rendering phase\n * @author NHN Ent. FE Development Team\n */\n'use strict';\n\nvar _ = require('underscore');\n\nvar View = require('../base/view');\nvar CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;\nvar attrNameConst = require('../common/constMap').attrName;\nvar classNameConst = require('../common/classNameConst');\n\n/**\n * Layer class that represents the state of rendering phase.\n * @module view/editingLayer\n * @extends module:base/view\n */\nvar EditingLayer = View.extend(/**@lends module:view/editingLayer.prototype */{\n    /**\n     * @constructs\n     * @param {Object} options - Options\n     */\n    initialize: function(options) {\n        this.renderModel = options.renderModel;\n        this.domState = options.domState;\n        this.inputPainters = options.inputPainters;\n\n        this.listenTo(this.renderModel, 'editingStateChanged', this._onEditingStateChanged);\n    },\n\n    className: classNameConst.LAYER_EDITING + ' ' + classNameConst.CELL_CONTENT,\n\n    /**\n     * Starts editing the given cell.\n     * @param {Object} cellData - cell data\n     * @private\n     */\n    _startEditing: function(cellData) {\n        var rowKey = cellData.rowKey;\n        var columnName = cellData.columnName;\n        var editType = tui.util.pick(cellData, 'columnModel', 'editOption', 'type');\n        var styleMap = this._calculateLayoutStyle(rowKey, columnName, this._isWidthExpandable(editType));\n        var painter = this.inputPainters[editType];\n\n        this.$el.html(painter.generateHtml(cellData))\n            .attr(attrNameConst.ROW_KEY, rowKey)\n            .attr(attrNameConst.COLUMN_NAME, columnName)\n            .css(styleMap).show();\n\n        this._adjustLeftPosition();\n        painter.focus(this.$el);\n    },\n\n    /**\n     * Returns whether the width is expandable.\n     * @param {String} editType - edit type\n     * @returns {Boolean}\n     * @private\n     */\n    _isWidthExpandable: function(editType) {\n        return _.contains(['checkbox', 'radio'], editType);\n    },\n\n    /**\n     * Fisishes editing the current cell.\n     * @private\n     */\n    _finishEditing: function() {\n        this.$el.removeAttr(attrNameConst.ROW_KEY);\n        this.$el.removeAttr(attrNameConst.COLUMN_NAME);\n        this.$el.empty().hide();\n    },\n\n    /**\n     * Adjust the left position of the layer not to lay beyond the boundary of the grid.\n     * @private\n     */\n    _adjustLeftPosition: function() {\n        var gridWidth = this.domState.getWidth();\n        var layerWidth = this.$el.outerWidth();\n        var layerLeftPos = this.$el.position().left;\n\n        if (layerLeftPos + layerWidth > gridWidth) {\n            this.$el.css('left', gridWidth - layerWidth);\n        }\n    },\n\n    /**\n     * Adjust offset value of TD, because it varies from browsers to browsers when borders are callapsed.\n     * @param {Number} offsetValue - offset value (offset.top or offset.left)\n     * @returns {Number}\n     * @private\n     */\n    _adjustCellOffsetValue: function(offsetValue) {\n        var browser = tui.util.browser;\n        var result = offsetValue;\n\n        if (browser.msie) {\n            if (browser.version === 9) {\n                result = offsetValue - 1;\n            } else if (browser.version > 9) {\n                result = Math.floor(offsetValue);\n            }\n        }\n\n        return result;\n    },\n\n    /**\n     * Calculates the position and the dimension of the layer and returns the object that contains css properties.\n     * @param {Stirng} rowKey - row key\n     * @param {String} columnName - column name\n     * @param {Boolean} expandable - true if the width of layer is expandable\n     * @returns {Object}\n     * @private\n     */\n    _calculateLayoutStyle: function(rowKey, columnName, expandable) {\n        var wrapperOffset = this.domState.getOffset();\n        var $cell = this.domState.getElement(rowKey, columnName);\n        var cellOffset = $cell.offset();\n        var cellHeight = $cell.height() + CELL_BORDER_WIDTH;\n        var cellWidth = $cell.width() + CELL_BORDER_WIDTH;\n\n        return {\n            top: this._adjustCellOffsetValue(cellOffset.top) - wrapperOffset.top,\n            left: this._adjustCellOffsetValue(cellOffset.left) - wrapperOffset.left,\n            height: cellHeight,\n            minWidth: expandable ? cellWidth : '',\n            width: expandable ? '' : cellWidth,\n            lineHeight: cellHeight + 'px'\n        };\n    },\n\n    /**\n     * Event handler for 'editingStateChanged' event on the render model.\n     * @param {Object} cellData - cell data\n     * @private\n     */\n    _onEditingStateChanged: function(cellData) {\n        if (cellData.isEditing) {\n            this._startEditing(cellData);\n        } else {\n            this._finishEditing();\n        }\n    },\n\n    /**\n     * Render\n     * @returns {Object} this instance\n     */\n    render: function() {\n        _.each(this.inputPainters, function(painter) {\n            painter.attachEventHandlers(this.$el, '');\n        }, this);\n\n        return this;\n    }\n});\n\n\nmodule.exports = EditingLayer;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"