    var Grid = View.Base.extend({
        scrollBarSize: 17,
        minimumHeight: 150, //그리드의 최소 높이값
        lside: null,
        rside: null,
        toolbar: null,
        cellFactory: null,


        events: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        keyMap: {
            'TAB': 9,
            'ENTER': 13,
            'CTRL': 17,
            'ESC': 27,
            'LEFT_ARROW': 37,
            'UP_ARROW': 38,
            'RIGHT_ARROW': 39,
            'DOWN_ARROW': 40,
            'CHAR_A': 65,
            'CHAR_C': 67,
            'CHAR_F': 70,
            'CHAR_R': 82,
            'CHAR_V': 86,
            'LEFT_WINDOW_KEY': 91,
            'F5': 116,
            'BACKSPACE': 8,
            'SPACE': 32,
            'PAGE_UP': 33,
            'PAGE_DOWN': 34,
            'HOME': 36,
            'END': 35,
            'DEL': 46,
            'UNDEFINED': 229
        },
        keyName: {
            9: 'TAB',
            13: 'ENTER',
            17: 'CTRL',
            27: 'ESC',
            37: 'LEFT_ARROW',
            38: 'UP_ARROW',
            39: 'RIGHT_ARROW',
            40: 'DOWN_ARROW',
            65: 'CHAR_A',
            67: 'CHAR_C',
            70: 'CHAR_F',
            82: 'CHAR_R',
            86: 'CHAR_V',
            91: 'LEFT_WINDOW_KEY',
            116: 'F5',
            8: 'BACKSPACE',
            32: 'SPACE',
            33: 'PAGE_UP',
            34: 'PAGE_DOWN',
            36: 'HOME',
            35: 'END',
            46: 'DEL',
            229: 'UNDEFINED'
        },
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            var id = Util.getUniqueKey();
            this.__instance[id] = this;

            var defaultOptions = {
                form: null,
                debug: false,
                columnFixIndex: 0,
                columnModelList: [],
                keyColumnName: null,
                selectType: '',

                autoNumbering: true,

                headerHeight: 35,
                rowHeight: 27,
                displayRowCount: 10,
                minimumColumnWidth: 50,
                notUseSmartRendering: false,
                columnMerge: [],
                minimumWidth: 300,      //grid의 최소 너비

                scrollX: true,
                scrollY: true,
                useDataCopy: true,

                toolbar: {
                    hasResizeHandler: true,
                    hasControlPanel: true,
                    hasPagination: true
                }
            };




            options = $.extend(true, defaultOptions, options);

            this.setOwnProperties({
                'cellFactory': null,
                'selection': null,
                'columnModel': null,
                'dataModel': null,
                'renderModel': null,
                'layoutModel': null,
                'focusModel': null,
                'addOn': {},
                'view': {
                    'lside': null,
                    'rside': null,
                    'toolbar': null,
                    'clipboard': null,
                    'layer': {
                        ready: null,
                        loading: null,
                        empty: null
                    }
                },
                'id' : id,
                'options' : options,
                'timeoutIdForResize': 0,
                'timeoutIdForSetRowList': 0,
                '__$el': this.$el.clone()
            });

            this._initializeModel();
            this._initializeListener();
            this._initializeView();

            this._initializeScrollBar();

            this._attachExtraEvent();

            this.render();

            this.updateLayoutData();

        },
        /**
         * rowKey 와 columnName 에 해당하는 값을 반환한다.
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
         * @return {(Number|String)}
         */
        getValue: function(rowKey, columnName, isOriginal) {
            var value;
            if (isOriginal) {
                value = this.dataModel.getOriginal(rowKey, columnName);
            } else {
                value = this.dataModel.get(rowKey).get(columnName);
            }
            return value;
        },
        /**
         * columnName에 해당하는 column data list를 리턴한다.
         *
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Array}
         */
        getColumnValue: function(columnName, isJsonString) {
            var valueList = this.dataModel.pluck(columnName);
            return isJsonString ? $.toJSON(valueList) : valueList;
        },
        /**
         * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
         * @param {(Number|String)} rowKey
         * @param {Boolean} isJsonString
         * @return {Object}
         */
        getRow: function(rowKey, isJsonString) {
            var row = this.dataModel.get(rowKey).toJSON();
            row = isJsonString ? $.toJSON(row) : row;
            return row;
        },
        /**
         * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
         * @param {Number} index
         * @return {Object}
         */
        getRowAt: function(index) {
            return this.dataModel.at(index).toJSON();
        },
        /**
         * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
         * @return {Number}
         */
        getRowCount: function() {
            return this.dataModel.length;
        },
        getRowSpan: function() {

        },
        /**
         * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
         * @return {(Number|String)}
         */
        getSelectedRowKey: function() {
            return this.focusModel.which().rowKey;
        },
        /**
         * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
         * 내부적으로 자동으로 mainRowKey 를 찾아 반환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {jQuery} 해당 jQuery Element
         */
        getElement: function(rowKey, columnName) {
            var $frame = this.columnModel.isLside(columnName) ? this.view.lside.$el : this.view.rside.$el;
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
            return $frame.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
        },
        /**
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
         */
        setValue: function(rowKey, columnName, columnValue, silent) {
            columnValue = typeof columnValue === 'string' ? $.trim(columnValue) : columnValue;
            var row = this.dataModel.get(rowKey),
                obj = {};
            if (row) {
                obj[columnName] = columnValue;
                row.set(obj, {
                    silent: silent
                });
                return true;
            }else {
                return false;
            }
        },
        /**
         * column 에 해당하는 값을 전부 변경한다.
         * @param {String} columnName
         * @param {(Number|String)} columnValue
         * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
         * @param {Boolean} silent
         */
        setColumnValue: function(columnName, columnValue, isCheckCellState, silent) {
            isCheckCellState = isCheckCellState === undefined ? true : isCheckCellState;
            var obj = {},
                cellState = {
                    isDisabled: false,
                    isEditable: true
                };
            obj[columnName] = columnValue;

            this.dataModel.forEach(function(row, key) {
                if (isCheckCellState) {
                    cellState = this.getCellState(row.get('rowKey'), columnName);
                }
                if (!cellState.isDisabled && cellState.isEditable) {
                    row.set(obj, {
                        silent: silent
                    });
                }
            }, this);
        },
        /**
         * set row list data
         * @param {Array} rowList
         * @param {boolean} [isParse=true]
         */
        setRowList: function(rowList, isParse) {
            this.showGridLayer('loading');
            isParse = isParse === undefined ? true : isParse;
            //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
            clearTimeout(this.timeoutIdForSetRowList);
            this.timeoutIdForSetRowList = setTimeout($.proxy(function() {
                this.dataModel.set(rowList, {
                    parse: isParse
                });
                if (!isParse) {
                    this.dataModel.setOriginalRowList(rowList);
                }
            }, this), 0);
        },
        /**
         * rowKey, columnName에 해당하는 셀에 포커싱한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.focusModel.focus(rowKey, columnName, isScrollable);
        },
        /**
         * 셀을 편집모드로 전환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         * @private
         */
        focusIn: function(rowKey, columnName, isScrollable) {
            var cellInstance;
            this.focus(rowKey, columnName, isScrollable);
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
            if (this.isEditable(rowKey, columnName)) {
                cellInstance = this.cellFactory.getInstance(this.columnModel.getEditType(columnName));
                cellInstance.focusIn(this.getElement(rowKey, columnName));
            } else {
                this.focusClipboard();
            }
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
         * @param {(Number|String)} rowIndex
         * @param {String} columnIndex
         * @param {Boolean} isScrollable
         */
        focusAt: function(rowIndex, columnIndex, isScrollable) {
            var row = this.dataModel.at(rowIndex),
                column = this.columnModel.at(columnIndex);
            if (row && column) {
                this.focus(row.get('rowKey'), column['columnName'], isScrollable);
            }
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱 후 편진모드로 전환 한다.
         * @param {(Number|String)} rowIndex
         * @param {String} columnIndex
         * @param {Boolean} isScrollable
         */
        focusInAt: function(rowIndex, columnIndex, isScrollable) {
            var row = this.dataModel.at(rowIndex),
                column = this.columnModel.at(columnIndex);
            if (row && column) {
                this.focusIn(row.get('rowKey'), column['columnName'], isScrollable);
            }
        },
        /**
         * 현재 포커스 된 컬럼이 있을 경우 포커스 상태를 해제한다
         */
        blur: function() {
            this.focusModel.blur();
        },
        /**
         * 전체 행을 선택한다.
         */
        checkAll: function() {
            this.setColumnValue('_button', true);
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        check: function(rowKey) {
            this.setValue(rowKey, '_button', true);
        },
        /**
         * 모든 행을 선택 해제 한다.
         */
        uncheckAll: function() {
            this.setColumnValue('_button', false);
        },
        /**
         * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        uncheck: function(rowKey) {
            this.setValue(rowKey, '_button', false);
        },

        /**
         * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
         */
        clear: function() {
            //@todo: empty 레이어 추가
            this.setRowList([]);
        },
        /**
         * @deprecated
         */
        checkRowState: function() {

        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalDta=false] 원본 데이터도 함께 삭제 할지 여부
         */
        removeRow: function(rowKey, isRemoveOriginalData) {
            this.dataModel.removeRow(rowKey, isRemoveOriginalData);
        },
        /**
         * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
         */
        enable: function() {

        },
        /**
         * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
         * @param {Boolean} [hasDimmedLayer=true]
         */
        disable: function(hasDimmedLayer) {

        },
        /**
         * rowKey에 해당하는 행을 활성화시킨다.
         * @param {(Number|String)} rowKey
         */
        enableRow: function(rowKey) {
            this.dataModel.setRowState(rowKey, '');
        },
        /**
         * rowKey에 해당하는 행을 비활성화 시킨다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        disableRow: function(rowKey) {
            this.dataModel.setRowState(rowKey, 'DISABLED');
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        enableCheck: function(rowKey) {
            this.dataModel.setRowState(rowKey, '');
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        disableCheck: function(rowKey) {
            this.dataModel.setRowState(rowKey, 'DISABLED_CHECK');
        },


        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @param {String} columnName
         * @param {(String|Number)} columnValue
         */
        filterData: function(columnName, columnValue) {

        },
        /**
         * 현재 선택된 행들의 키값만을 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowKeyList: function(isJsonString) {
            var rowKeyList = [];
            _.each(this.dataModel.where({
                '_button' : true
            }), function(row) {
                rowKeyList.push(row.get('rowKey'));
            }, this);
            return rowKeyList;
        },
        /**
         * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowList: function(isJsonString) {
            return this.dataModel.getRowList(true);
        },
        /**
         * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
         * @return {Array}
         */
        getColumnModel: function() {
            return this.columnModel.get('columnModelList');
        },
        /**
         * 현재 비활성화된 행들의 키값만을 배열로 리턴한다.
         * @return {Array}
         */
        getDisabledRowKeyList: function() {
            //@todo
        },
        /**
         * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
         * 리턴되는 객체에는 inserted, edited, deleted 라는 필드가 있고,
         * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
         *
         * @param {Boolean} [isOnlyRowKeyList]  true로 설정하면 키값만 저장하여 리턴
         * @param {Boolean} [isJsonString]  변경된 데이터 객체를 JSON문자열로 변환하여 리턴
         * @param {Boolean} [filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}}
         */
        getModifiedRowList: function(isOnlyRowKeyList, isJsonString, filteringColumnList) {
            //@todo 파라미터 옵션에 따른 데이터 형 변화

            return this.dataModel.getModifiedRowList({
                isOnlyRowKeyList: isOnlyRowKeyList,
                filteringColumnList: filteringColumnList
            });
        },

        /**
         * 현재 그리드의 제일 끝에 행을 추가한다.
         * @param {object} rowData
         */
        appendRow: function(row) {
            this.dataModel.append(row);
        },
        /**
         * 현재 그리드의 제일 앞에 행을 추가한다.
         * @param {object} rowData
         */
        prependRow: function(row) {
            this.dataModel.prepend(row);
        },
        /**
         * 열 고정 위치를 변경한다.
         *
         * @param {Number} index 고정시킬 열의 인덱스
         */
        setColumnFixIndex: function(columnFixIndex) {
            this.option({
                columnFixIndex: columnFixIndex
            });
            this.columnModel.set({columnFixIndex: columnFixIndex});
        },

        /**
         * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
         * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
         * @return {Boolean}
         */
        isChanged: function() {
            var modifiedRowMap = this.getModifiedRowList(),
                count = 0, name;

            for (name in modifiedRowMap) {
                if (modifiedRowMap[name].length) {
                    return true;
                }
            }
            return false;
        },
        /**
         * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
         * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
         */
        restore: function() {
            var originalRowList = this.dataModel.getOriginalRowList();
            this.setRowList(originalRowList, false);
        },
        refreshLayout: function() {
            //todo
        },
        addClassNameToColumn: function() {

        },
        addClassNameToRow: function() {

        },
        removeClassNameFromColumn: function() {

        },
        removeClassNameFromRow: function() {

        },
        replaceRowList: function() {

        },
        /**
         * rowKey에 해당하는 행에 대해 선택한다.
         * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
         *
         * @param {(Number|String)} rowKey
         */
        select: function(rowKey) {
            this.focusModel.select(rowKey);
        },
        unselect: function() {
            this.focusModel.unselect();
        },
        setGridSize: function(size) {
            var dimensionModel = this.dimensionModel,
                width = size && size.width || dimensionModel.get('width'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                headerHeight = dimensionModel.get('headerHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight');

            if (size && size.height) {
                bodyHeight = height - (headerHeight + toolbarHeight);
            }
        },
        setHeaderColumnTitle: function() {

        },
        setScrollBarPosition: function() {

        },


        /**
         * Grid Layer 를 모두 감춘다.
         */
        hideGridLayer: function() {
            _.each(this.view.layer, function(view, name) {
                view.hide();
            }, this);
        },
        /**
         * name 에 해당하는 Grid Layer를 보여준다.
         * @param {String} name ready|empty|loading
         */
        showGridLayer: function(name) {
            this.hideGridLayer();
            this.view.layer[name] ? this.view.layer[name].show() : null;
        },

        /**
         * pagination instance 를 반환한다.
         * @return {instance|*|exports.scopeToPunc.instance|exports.baseTags.instance}
         */
        getPaginationInstance: function() {
            var paginationView = this.view.toolbar.pagination;
            if (paginationView) {
                return paginationView.instance;
            }
        },
        /**
         * addon 을 활성화한다.
         * @param {string} name addon 이름
         * @param {object} options addon 에 넘길 파라미터
         * @return {Grid}
         */
        use: function(name, options) {
            options = $.extend({grid: this}, options);
            if (AddOn[name]) {
                this.addOn[name] = new AddOn[name](options);
            }
            return this;
        },

        /**
         * event 속성에 정의되지 않은 이벤트 attach 하는 메서드
         * @private
         */
        _attachExtraEvent: function() {
            $(window).on('resize', $.proxy(this._onWindowResize, this));
        },
        /**
         * window resize  이벤트 핸들러
         * @param {event} resizeEvent
         * @private
         */
        _onWindowResize: function(resizeEvent) {
            var width = Math.max(this.option('minimumWidth'), this.$el.css('width', '100%').width());
            this.dimensionModel.set('width', width);
        },
        _initializeListener: function() {
            this.listenTo(this.dimensionModel, 'change:width', this._onWidthChange);
            this.listenTo(this.dimensionModel, 'change:bodyHeight', this._setHeight);
            this.listenTo(this.focusModel, 'focus', this._onFocusChanged);
        },
        _onFocusChanged: function(rowKey) {
            if (this.columnModel.get('selectType') === 'radio') {
                this.uncheckAll();
                this.check(rowKey);
            }
        },
        /**
         * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
         * @private
         */
        updateLayoutData: function() {
            var offset = this.$el.offset(),
                rsideTotalWidth = this.dimensionModel.getFrameWidth('R'),
                maxScrollLeft = rsideTotalWidth - this.dimensionModel.get('rsideWidth');

            this.renderModel.set({
                maxScrollLeft: maxScrollLeft
            });
            this.dimensionModel.set({
                offsetTop: offset.top,
                offsetLeft: offset.left,
                width: this.$el.width(),
                height: this.$el.height(),
                toolbarHeight: this.view.toolbar.$el.height()
            });
        },
        /**
         * width 변경시 layout data 를 update 한다.
         * @private
         */
        _onWidthChange: function() {
            this.updateLayoutData();
        },

        option: function(key, value) {
            if (value === undefined) {
                return this.options[key];
            }else {
                this.options[key] = value;
                return this;
            }
        },
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                eventData = this.createEventData(clickEvent);
            this.trigger('click', eventData);
            if (eventData.isStopped()) return;

            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select') || $target.is('label'))) {
            }


        },
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target),
                eventData = this.createEventData(mouseDownEvent);
            this.trigger('mousedown', eventData);

            if (eventData.isStopped()) return;
            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))) {
                mouseDownEvent.preventDefault();
                this.focusClipboard();
                this.selection.show();
            }
        },
        focusClipboard: function() {
            this.view.clipboard.$el.focus();
        },
        /**
         * _initializeModel
         *
         * Initialize data model instances
         * @param options
         * @private
         */
        _initializeModel: function() {
            var offset = this.$el.offset();

            //define column model
            this.columnModel = new Data.ColumnModel({
                grid: this,
                hasNumberColumn: this.option('autoNumbering'),
                keyColumnName: this.option('keyColumnName'),
                columnFixIndex: this.option('columnFixIndex'),
                selectType: this.option('selectType')
            });
            this.setColumnModelList(this.option('columnModelList'));

            //define layout model
            this.dimensionModel = new Model.Dimension({
                grid: this,
                offsetTop: offset.top,
                offsetLeft: offset.left,
                width: this.$el.width(),
                height: this.$el.height(),
                headerHeight: this.option('headerHeight'),
                rowHeight: this.option('rowHeight'),

                scrollX: !!this.option('scrollX'),
                scrollBarSize: this.scrollBarSize,

                minimumColumnWidth: this.option('minimumColumnWidth'),
                displayRowCount: this.option('displayRowCount')
            });

            // define focus model
            this.focusModel = new Model.Focus({
                grid: this,
                scrollX: !!this.option('scrollX'),
                scrollY: !!this.option('scrollY'),
                scrollBarSize: this.scrollBarSize
            });

            //define rowList
            this.dataModel = new Data.RowList([], {
                grid: this
            });
            this.dataModel.reset([]);

            if (this.option('notUseSmartRendering') === true) {
                this.renderModel = new Model.Renderer({
                    grid: this
                });
            }else {
                this.renderModel = new Model.Renderer.Smart({
                    grid: this
                });
            }

            this.cellFactory = this.createView(View.CellFactory, { grid: this });
        },
        /**
         * _initializeView
         *
         * Initialize view instances
         * @private
         */
        _initializeView: function() {
            this.cellFactory = this.createView(View.CellFactory, {
                grid: this
            });

            this.selection = this.createView(View.Selection, {
                grid: this
            });

            //define header & body area
            this.view.lside = this.createView(View.Layout.Frame.Lside, {
                grid: this
            });

            this.view.rside = this.createView(View.Layout.Frame.Rside, {
                grid: this
            });

            this.view.toolbar = this.createView(View.Layout.Toolbar, {
                grid: this
            });

            this.view.layer.ready = this.createView(View.Layer.Ready, {
                grid: this
            });
            this.view.layer.empty = this.createView(View.Layer.Empty, {
                grid: this
            });
            this.view.layer.loading = this.createView(View.Layer.Loading, {
                grid: this
            });

            this.view.clipboard = this.createView(View.Clipboard, {
                grid: this
            });
        },

        _initializeScrollBar: function() {
//            if(!this.option('scrollX')) this.$el.css('overflowX', 'hidden');
//            if(!this.option('scrollY')) this.$el.css('overflowY', 'hidden');
        },

        /**
         * render
         *
         * Rendering grid view
         */
        render: function() {
            var leftLine = $('<div>').addClass('left_line'),
                rightLine = $('<div>').addClass('right_line');

            this.$el.addClass('grid_wrapper')
                .addClass('uio_grid')
                .attr('instanceId', this.id)
                .append(this.view.layer.empty.render().el)
                .append(this.view.layer.loading.render().el)
                .append(this.view.layer.ready.render().el);

            this.view.layer.loading.show('초기화 중입니다.');

            this.$el.append(this.view.lside.render().el)
                .append(this.view.rside.render().el)
                .append(this.view.toolbar.render().el)
                .append(leftLine)
                .append(rightLine)
                .append(this.view.clipboard.render().el);
            this._setHeight();
        },
        _setHeight: function() {
            var bodyHeight = this.dimensionModel.get('bodyHeight'),
                headerHeight = this.dimensionModel.get('headerHeight'),
                toolbarHeight = this.view.toolbar.$el.height(),
                height = toolbarHeight + headerHeight + bodyHeight;
            this.$el.css('height', height + 'px');
            this.dimensionModel.set({
                toolbarHeight: toolbarHeight
            });
        },
        /**
         * 정렬이 되었는지 여부 반환
         * @return {Boolean}
         */
        isSorted: function() {
            return this.dataModel.isSortedByField();
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀이 편집 가능한지 여부를 반환한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @return {Boolean}
         */
        isEditable: function(rowKey, columnName) {
            var focused = this.focusModel.which(),
                dataModel = this.dataModel,
                row,
                isEditable;

            rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
            columnName = columnName !== undefined ? columnName : focused.columnName;
            row = dataModel.get(rowKey);
            isEditable = row ? row.isEditable(columnName) : true;
            return isEditable;
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀이 disable 상태인지 여부를 반환한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @return {Boolean}
         */
        isDisabled: function(rowKey, columnName) {
            var focused = this.focusModel.which(),
                dataModel = this.dataModel,
                row,
                isDisabled;

            rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
            columnName = columnName !== undefined ? columnName : focused.columnName;
            row = dataModel.get(rowKey);
            isDisabled = row ? row.isDisabled(columnName) : false;
            return isDisabled;
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @return {{isEditable: boolean, isDisabled: boolean}}
         */
        getCellState: function(rowKey, columnName) {
            var focused = this.focusModel.which(),
                dataModel = this.dataModel;

            rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
            columnName = columnName !== undefined ? columnName : focused.columnName;

            return dataModel.get(rowKey).getCellState(columnName);
        },
        setColumnModelList: function(columnModelList) {
            this.columnModel.set('columnModelList', columnModelList);
        },
        /**
         * sort by columnName
         *
         * @param columnName
         */
        sort: function(columnName) {
            this.dataModel.sortByField(columnName);
        },
        getRowList: function() {
            return this.dataModel.getRowList();
        },
//
//
//        /**
//         * mainRowKey 를 반환한다.
//         * @param {(Number|String)} rowKey
//         * @param {String} columnName
//         * @return {(Number|String)}
//         */
//        getMainRowKey: function(rowKey, columnName) {
//            var dataModel = this.dataModel,
//                row = dataModel.get(rowKey),
//                rowSpanData;
//            if (dataModel.isRowSpanEnable()) {
//                rowSpanData = row && row.getRowSpanData(columnName);
//                rowKey = rowSpanData ? rowSpanData.mainRowKey : rowKey;
//            }
//            return rowKey;
//        },
        /**
         * rowKey 와 columnName 에 해당하는 text 형태의 셀의 값을 삭제한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @param {Boolean} silent
         */
        del: function(rowKey, columnName, silent) {
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

            var editType = this.columnModel.getEditType(columnName),
                isDisabledCheck = this.dataModel.get(rowKey).getRowState().isDisabledCheck,
                deletableEditTypeList = ['text', 'text-convertible'],
                isDeletable = $.inArray(editType, deletableEditTypeList) !== -1,
                selectType = this.option('selectType');

            if (isDeletable && this.isEditable(rowKey, columnName)) {
                this.setValue(rowKey, columnName, '', silent);
                //silent 의 경우 데이터 모델의 change 이벤트가 발생하지 않기 때문에, 강제로 checkbox 를 세팅한다.
                if (silent && selectType === 'checkbox' && !isDisabledCheck) {
                    this.setValue(rowKey, '_button', true, silent);
                }
            }
        },

        /**
         * @deprecated
         * @param whichSide
         * @return {*}
         * @private
         */
        _getDataCollection: function(whichSide) {
            return this.renderModel.get(whichSide);
        },

        destroy: function() {

            this.stopListening();
            this.destroyChildren();
            this.$el.replaceWith(this.__$el);
            for (var property in this) {
                this[property] = null;
                delete this[property];
            }
        }
    });

    Grid.prototype.__instance = Grid.prototype.__instance || {};