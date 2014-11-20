    /**
     * 크기 관련 데이터 저장
     * @type {*|void}
     */
    Model.Dimension = Model.Base.extend({
        models: null,
        columnModel: null,
        defaults: {
            offsetLeft: 0,
            offsetTop: 0,

            width: 0,

            headerHeight: 0,
            bodyHeight: 0,
            toolbarHeight: 0,

            rowHeight: 0,

            rsideWidth: 0,
            lsideWidth: 0,
            columnWidthList: [],

            minimumColumnWidth: 0,
            displayRowCount: 1,
            scrollBarSize: 17,
            scrollX: true
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.columnModel = this.grid.columnModel;
            this.listenTo(this.columnModel, 'change', this._onWidthChange);

            this.on('change:width', this._onWidthChange, this);
            this._setColumnWidthVariables();
            this._setBodyHeight();
        },
        /**
         * 인자로 columnWidthList 배열을 받아 현재 total width 에 맞게 계산한다.
         *
         * @param {Array} columnWidthList
         * @return {Array}
         * @private
         */
        _calculateColumnWidthList: function(columnWidthList) {
            var columnFixIndex = this.columnModel.get('columnFixIndex'),
                totalWidth = this.get('width'),
                availableTotalWidth,
                remainWidth,
                unassignedWidth,
                newColumnWidthList = [],
                width = 0,
                currentWidth = 0,
                unassignedCount = 0;

            availableTotalWidth = totalWidth - columnWidthList.length - 1;

            if (columnFixIndex > 0) {
                availableTotalWidth -= 1;
            }

            _.each(columnWidthList, function(columnWidth) {
                if (columnWidth > 0) {
                    width = Math.max(this.get('minimumColumnWidth'), columnWidth);
                    newColumnWidthList.push(width);
                    currentWidth += width;
                }else {
                    newColumnWidthList.push(-1);
                    unassignedCount++;
                }
            }, this);

            remainWidth = availableTotalWidth - currentWidth;

            if (availableTotalWidth > currentWidth && unassignedCount === 0) {
                newColumnWidthList[newColumnWidthList.length - 1] += remainWidth;
            }

            if (availableTotalWidth > currentWidth) {
                remainWidth = availableTotalWidth - currentWidth;
                unassignedWidth = Math.max(this.get('minimumColumnWidth'), Math.floor(remainWidth / unassignedCount));
            }else {
                unassignedWidth = this.get('minimumColumnWidth');
            }
            _.each(newColumnWidthList, function(newColumnWidth, index) {
                if (newColumnWidth === -1) {
                    newColumnWidthList[index] = unassignedWidth;
                }
            }, this);
            return newColumnWidthList;
        },
        /**
         * columnModel 에 설정된 width 값을 기준으로 widthList 를 작성한다.
         *
         * @return {Array}
         * @private
         */
        _getOriginalWidthList: function() {
            var columnModelList = this.columnModel.get('visibleList'),
                columnWidthList = [];
            for (var i = 0, len = columnModelList.length; i < len; i++) {
                if (columnModelList[i].width) {
                    columnWidthList.push(columnModelList[i].width);
                }else {
                    columnWidthList.push(-1);
                }
            }
            return this._calculateColumnWidthList(columnWidthList);
        },
        /**
         * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
         * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
         * @return {Number}
         */
        getFrameWidth: function(whichSide) {
            var columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnWidthList = this.getColumnWidthList(whichSide),
                frameWidth = this._getFrameWidth(columnWidthList);

            if (!ne.util.isDefined(whichSide) && columnFixIndex > 0) {
                ++frameWidth;
            }
            return frameWidth;
        },
        /**
         * widthList 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
         * @param {Array} widthList
         * @return {Number}
         * @private
         */
        _getFrameWidth: function(widthList) {
            return widthList.length ? Util.sum(widthList) + widthList.length + 1 : 0;
        },

        /**
         * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
         * @param {Array} [columnWidthList] 인자가 존재하지 않을 경우, 현재 columnModel 에 저장된 정보 기준으로 columnWidth 를 설정한다.
         * @private
         */
        _setColumnWidthVariables: function(columnWidthList) {
            columnWidthList = columnWidthList || this._getOriginalWidthList();

            var rsideWidth,
                lsideWidth,
                totalWidth = this.get('width'),
                columnFixIndex = this.columnModel.get('columnFixIndex'),
                maxLeftSideWidth = this._getMaxLeftSideWidth(),
                lsideWidthList = columnWidthList.slice(0, columnFixIndex),
                rsideWidthList = columnWidthList.slice(columnFixIndex);

            lsideWidth = this._getFrameWidth(lsideWidthList);
            if (maxLeftSideWidth < lsideWidth) {
                lsideWidthList = this._adjustLeftSideWidthList(lsideWidthList, maxLeftSideWidth);
                lsideWidth = this._getFrameWidth(lsideWidthList);
                columnWidthList = lsideWidthList.concat(rsideWidthList);
            }
            rsideWidth = totalWidth - lsideWidth;
            this.set({
                rsideWidth: rsideWidth,
                lsideWidth: lsideWidth,
                columnWidthList: columnWidthList
            });
            this.trigger('columnWidthChanged');
        },
        /**
         * 열 고정 영역의 minimum width 값을 구한다.
         * @return {number}
         * @private
         */
        _getMinLeftSideWidth: function() {
            var minimumColumnWidth = this.get('minimumColumnWidth'),
                columnFixIndex = this.columnModel.get('columnFixIndex'),
                minWidth;

            minWidth = columnFixIndex ? (columnFixIndex * (minimumColumnWidth + 1)) + 1 : 0;
            return minWidth;
        },
        /**
         * 열 고정 영역의 maximum width 값을 구한다.
         * @return {number}
         * @private
         */
        _getMaxLeftSideWidth: function() {
            var maxWidth = Math.ceil(this.get('width') * 0.9);
            maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
            return maxWidth;
        },
        /**
         * 계산한 cell의 위치를 리턴한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @return {{top: *, left: number, right: *, bottom: *}}
         */
        getCellPosition: function(rowKey, columnName) {
            var top, left = 0, right, bottom, i = 0,
                dataModel = this.grid.dataModel,
                offsetLeft = this.get('offsetLeft'),
                offsetTop = this.get('offsetTop'),
                rowHeight = this.get('rowHeight'),
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName),
                rowIdx, spanCount,
                columnWidthList = this.get('columnWidthList'),
                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnIdx = this.grid.columnModel.indexOfColumnName(columnName, true);


            if (!rowSpanData.isMainRow) {
                rowKey = rowSpanData.mainRowKey;
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
            }

            spanCount = rowSpanData.count || 1;

            rowIdx = dataModel.indexOfRowKey(rowKey);

            top = Util.getHeight(rowIdx, rowHeight);
            bottom = top + Util.getHeight(spanCount, rowHeight) - 1;

            if (columnFixIndex <= columnIdx) {
                i = columnFixIndex;
            }

            for (; i < columnIdx; i++) {
                left += columnWidthList[i] + 1;
            }

            right = left + columnWidthList[i] + 1;

            return {
                top: top,
                left: left,
                right: right,
                bottom: bottom
            };
        },
        /**
         * columnFixIndex 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
         * @param {Array} lsideWidthList
         * @param {Number} totalWidth
         * @return {Array}
         * @private
         */
        _adjustLeftSideWidthList: function(lsideWidthList, totalWidth) {
            var i = lsideWidthList.length - 1,
                minimumColumnWidth = this.get('minimumColumnWidth'),
                currentWidth = this._getFrameWidth(lsideWidthList),
                diff = currentWidth - totalWidth,
                changedWidth;
            if (diff > 0) {
                while (i >= 0 && diff > 0) {
                    changedWidth = Math.max(minimumColumnWidth, lsideWidthList[i] - diff);
                    diff -= lsideWidthList[i] - changedWidth;
                    lsideWidthList[i] = changedWidth;
                    i--;
                }
            } else if (diff < 0) {
                lsideWidthList[i] += Math.abs(diff);
            }
            return lsideWidthList;
        },
        /**
         * body height 계산
         * @private
         */
        _setBodyHeight: function() {
            var height = Util.getHeight(this.get('displayRowCount'), this.get('rowHeight'));
            if (this.get('scrollX')) {
                height += this.get('scrollBarSize');
            }
            this.set('bodyHeight', height);
        },
        /**
         * 현재 화면에 보이는 row 개수를 반환
         * @return {number}
         */
        getDisplayRowCount: function() {
            return Util.getDisplayRowCount(this.get('bodyHeight') - this.get('toolbarHeight'), this.get('rowHeight'));
        },
        /**
         * scrollX 높이를 구한다.
         * @return {number}
         */
        getScrollXHeight: function() {
            return +this.get('scrollX') * this.get('scrollBarSize');
        },
        /**
         * _onWidthChange
         *
         * width 값 변경시 각 column 별 너비를 계산하는 로직
         * @param {object} model
         * @private
         */
        _onWidthChange: function(model) {
            var curColumnWidthList = this.get('columnWidthList');
            this._setColumnWidthVariables(this._calculateColumnWidthList(curColumnWidthList));
        },
        /**
         * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
         * @param {Number} index
         * @param {Number} width
         */
        setColumnWidth: function(index, width) {
            width = Math.max(width, this.get('minimumColumnWidth'));
            var curColumnWidthList = this.get('columnWidthList'),
                calculatedColumnWidthList;
            if (ne.util.isDefined(curColumnWidthList[index])) {
                curColumnWidthList[index] = width;
                calculatedColumnWidthList = this._calculateColumnWidthList(curColumnWidthList);
                this._setColumnWidthVariables(calculatedColumnWidthList);
            }
        },
        /**
         * L side 와 R side 에 따른 columnWidthList 를 반환한다.
         * @param {String} whichSide 생략했을 때 전체 columnList 반환
         * @return {Array}
         */
        getColumnWidthList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnFixIndex = this.columnModel.get('columnFixIndex');
            var columnList = [];

            switch (whichSide) {
                case 'L':
                    columnList = this.get('columnWidthList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnList = this.get('columnWidthList').slice(columnFixIndex);
                    break;
                default :
                    columnList = this.get('columnWidthList');
                    break;
            }
            return columnList;
        }
    });