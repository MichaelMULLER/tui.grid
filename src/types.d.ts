import { CellValue } from './store/types';

export interface OptGrid {
  el: HTMLElement;
  data?: OptRow[];
  columns: OptColumn[];
  columnOptions?: OptColumnOptions;
  width?: number | 'auto';
  bodyHeight?: number | 'fitToParent' | 'auto';
  minBodyHeight?: number;
  rowHeight?: number | 'auto';
  minRowHeight?: number;
  scrollX?: boolean;
  scrollY?: boolean;
  rowHeaders?: OptRowHeader[];
  summary?: OptSummaryData;
}

export interface ExtraData {
  height?: number;
}

export type CellValue = number | string | boolean | null | undefined;

export type SummaryPosition = 'top' | 'bottom';

export type OptRow = {
  [propName: string]: CellValue;
} & {
  _extraData?: ExtraData;
};

export type OptRowHeader = string | OptMetaColumn;

interface CellEditor {
  type: string;
  [propName: string]: any;
}

export interface OptColumn {
  name: string;
  title?: string;
  hidden?: boolean;
  width?: number | 'auto';
  editor?: string | CellEditor;
  viewer?: string | boolean;
  resizable?: boolean;
  minWidth?: number;
  align?: string | 'left' | 'center' | 'right';
}

export interface OptColumnOptions {
  minWidth?: number;
  frozenCount?: number;
  frozenBorderWidth?: number;
}

export interface OptHeightResizeHandleStyle {
  background?: string;
  border?: string;
}

export interface OptFrozenBorderStyle {
  border?: string;
}

export interface OptPaginationStyle {
  background?: string;
  border?: string;
}

export interface OptTableOutlineStyle {
  border?: string;
  showVerticalBorder?: boolean;
}

export interface OptSelectionLayerStyle {
  background?: string;
  border?: string;
}

export interface OptScrollbarStyle {
  border?: string;
  background?: string;
  emptySpace?: string;
  thumb?: string;
  active?: string;
}

export interface OptTableHeaderStyle {
  background?: string;
  border?: string;
}

export interface OptTableSummaryStyle {
  background?: string;
  border?: string;
}

export interface OptTableBodyStyle {
  background?: string;
}

export interface OptTableAreaStyle {
  header?: OptTableHeaderStyle;
  body?: OptTableBodyStyle;
  summary?: OptTableSummaryStyle;
}

export interface OptCellStyle {
  background?: string;
  border?: string;
  text?: string;
  showVerticalBorder?: boolean;
  showHorizontalBorder?: boolean;
}

export interface OptBasicCellStyle {
  background?: string;
  text?: string;
}

export interface OptCellFocusedStyle {
  background?: string;
  border?: string;
}

export interface OptCellDummyStyle {
  background?: string;
}

export interface OptTableCellStyle {
  normal?: OptCellStyle;
  head?: OptCellStyle;
  selectedHead?: OptBasicCellStyle;
  rowHead?: OptCellStyle;
  selectedRowHead?: OptBasicCellStyle;
  summary?: OptCellStyle;
  focused?: OptCellFocusedStyle;
  focusedInactive?: OptCellFocusedStyle;
  required?: OptBasicCellStyle;
  editable?: OptBasicCellStyle;
  disabled?: OptBasicCellStyle;
  invalid?: OptBasicCellStyle;
  currentRow?: OptBasicCellStyle;
  evenRow?: OptBasicCellStyle;
  oddRow?: OptBasicCellStyle;
  dummy?: OptCellDummyStyle;
}

export interface OptPreset {
  outline?: OptTableOutlineStyle;
  selection?: OptSelectionLayerStyle;
  scrollbar?: OptScrollbarStyle;
  frozenBorder?: OptFrozenBorderStyle;
  area?: OptTableAreaStyle;
  cell?: OptTableCellStyle;
  heightResizeHandle?: OptHeightResizeHandleStyle;
  pagination?: OptPaginationStyle;
}

export interface OptHeightResizeHandleStyle {
  background?: string;
  border?: string;
}

export interface OptFrozenBorderStyle {
  border?: string;
}

export interface OptPaginationStyle {
  background?: string;
  border?: string;
}

export interface OptTableOutlineStyle {
  border?: string;
  showVerticalBorder?: boolean;
}

export interface OptSelectionLayerStyle {
  background?: string;
  border?: string;
}

export interface OptScrollbarStyle {
  border?: string;
  background?: string;
  emptySpace?: string;
  thumb?: string;
  active?: string;
}

export interface OptTableHeaderStyle {
  background?: string;
  border?: string;
}

export interface OptTableSummaryStyle {
  background?: string;
  border?: string;
}

export interface OptTableBodyStyle {
  background?: string;
}

export interface OptTableAreaStyle {
  header?: OptTableHeaderStyle;
  body?: OptTableBodyStyle;
  summary?: OptTableSummaryStyle;
}

export interface OptCellStyle {
  background?: string;
  border?: string;
  text?: string;
  showVerticalBorder?: boolean;
  showHorizontalBorder?: boolean;
}

export interface OptBasicCellStyle {
  background?: string;
  text?: string;
}

export interface OptCellFocusedStyle {
  background?: string;
  border?: string;
}

export interface OptCellDummyStyle {
  background?: string;
}

export interface OptTableCellStyle {
  normal?: OptCellStyle;
  head?: OptCellStyle;
  selectedHead?: OptBasicCellStyle;
  rowHead?: OptCellStyle;
  selectedRowHead?: OptBasicCellStyle;
  summary?: OptCellStyle;
  focused?: OptCellFocusedStyle;
  focusedInactive?: OptCellFocusedStyle;
  required?: OptBasicCellStyle;
  editable?: OptBasicCellStyle;
  disabled?: OptBasicCellStyle;
  invalid?: OptBasicCellStyle;
  currentRow?: OptBasicCellStyle;
  evenRow?: OptBasicCellStyle;
  oddRow?: OptBasicCellStyle;
  dummy?: OptCellDummyStyle;
}

export interface OptPreset {
  outline?: OptTableOutlineStyle;
  selection?: OptSelectionLayerStyle;
  scrollbar?: OptScrollbarStyle;
  frozenBorder?: OptFrozenBorderStyle;
  area?: OptTableAreaStyle;
  cell?: OptTableCellStyle;
  heightResizeHandle?: OptHeightResizeHandleStyle;
  pagination?: OptPaginationStyle;
}

export interface OptI18nLanguage {
  [propName: string]: OptI18nData;
}

export interface OptI18nData {
  display?: {
    noData?: string;
    loadingData?: string;
    resizeHandleGuide?: string;
  };
  net?: {
    confirmCreate?: string;
    confirmUpdate?: string;
    confirmDelete?: string;
    confirmModify?: string;
    noDataToCreate?: string;
    noDataToUpdate?: string;
    noDataToDelete?: string;
    noDataToModify?: string;
    failResponse?: string;
  };
}

export interface OptMetaColumn extends Partial<OptColumn> {
  type: string | 'rowNum' | 'checkbox' | 'radio';
}

export interface OptSummaryData {
  height?: number;
  position?: SummaryPosition;
  defaultContent?: string | OptSummaryColumnContentMap;
  columnContent?: {
    [propName: string]: string | OptSummaryColumnContentMap;
  };
}

export interface OptSummaryColumnContentMap {
  useAutoSummary?: boolean;
  template?: (valueMap: OptSummaryValueMap) => string;
}

export interface OptSummaryValueMap {
  sum: number;
  avg: number;
  min: number;
  max: number;
  cnt: number;
}