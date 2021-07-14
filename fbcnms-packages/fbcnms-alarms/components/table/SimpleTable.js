/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as React from 'react';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Chip from '@material-ui/core/Chip';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import MaterialTable from 'material-table';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RefreshIcon from '@material-ui/icons/Refresh';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import {forwardRef} from 'react';
import {makeStyles} from '@material-ui/styles';
import {useState} from 'react';

const useStyles = makeStyles(theme => ({
  labelChip: {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.secondary.main,
    margin: '5px',
  },
  ellipsisChip: {
    display: 'block',
    maxWidth: 256,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

type ActionMenuItems = {
  name: string,
  handleFunc?: () => void | (() => Promise<void>),
};

type ColumnType =
  | 'boolean'
  | 'numeric'
  | 'date'
  | 'datetime'
  | 'time'
  | 'currency';

type ActionTableColumn = {
  title: string,
  type?: ColumnType,
  field: string,
};

type ActionTableOptions = {
  actionsColumnIndex: number,
  pageSize?: number,
  pageSizeOptions: Array<number>,
  rowStyle?: {},
  headerStyle?: {},
};

type ActionOrderType = {
  field: string,
  title: string,
  tableData: {},
};

export type ActionFilter = {
  column: ActionTableColumn,
  value: string,
};

export type ActionQuery = {
  filters: Array<ActionFilter>,
  orderBy: ActionOrderType,
  orderDirection: string,
  page: number,
  pageSize: number,
  search: string,
  totalCount: number,
};

export type ActionTableProps<T> = {
  tableRef?: {},
  toolbar?: {},
  editable?: {},
  localization?: {},
  title?: string,
  onRowClick?: (T, ?T) => void,
  columnStruct: Array<ActionTableColumn>,
  menuItems?: Array<ActionMenuItems>,
  actions?: Array<{}>,
  tableData: Array<T> | (ActionQuery => {}),
  options?: ActionTableOptions,
  detailPanel?: Array<{}>,
};

const renderLabelValue = (labelValue: LabelVal) => {
  if (typeof labelValue === 'boolean') {
    return labelValue ? 'true' : 'false';
  }
  if (typeof labelValue === 'string' && labelValue.trim() === '') {
    return null;
  }
  return labelValue;
};

export type CellProps<TValue> = {
  value: TValue,
};
type LabelVal = string | number | boolean;
type Labels = {[string]: LabelVal};
export function LabelsCell({
  value,
}: CellProps<Labels> & {hideFields?: Array<string>}) {
  const classes = useStyles();
  const labels = value;
  return (
    <div>
      {Object.keys(labels).map(keyName => {
        const val = renderLabelValue(labels[keyName]);
        return (
          <Chip
            key={keyName}
            classes={{label: classes.ellipsisChip}}
            className={classes.labelChip}
            label={
              <span>
                <em>{keyName}</em>
                {val !== null && typeof val !== 'undefined' ? '=' : null}
                {val}
              </span>
            }
            size="small"
          />
        );
      })}
    </div>
  );
}
type GroupsList = Array<Labels>;

export function MultiGroupsCell({value}: CellProps<GroupsList>) {
  const classes = useStyles();
  return (
    <>
      {value.map((cellValue, idx) => (
        <div key={idx}>
          {Object.keys(cellValue).map(keyName => (
            <Chip
              key={keyName}
              classes={{label: classes.ellipsisChip}}
              className={classes.labelChip}
              label={
                <span>
                  <em>{keyName}</em>={renderLabelValue(cellValue[keyName])}
                </span>
              }
              size="small"
            />
          ))}
        </div>
      ))}
    </>
  );
}

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),

  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),

  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Retry: forwardRef((props, ref) => <RefreshIcon {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
};

export default function SimpleTable<T>(props: ActionTableProps<T>) {
  const {columnStruct, tableData, onRowClick} = props;
  const actionTableJSX = [];
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event, row: T) => {
    setAnchorEl(event.currentTarget);
    if (props.onRowClick) {
      props.onRowClick(row);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (props.menuItems) {
    // Actions menu
    const menuItems: Array<ActionMenuItems> = props.menuItems;
    actionTableJSX.push(
      <Menu
        key="menu"
        id="actions-menu"
        data-testid="actions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        {menuItems.map(item => (
          <MenuItem
            key={item.name}
            onClick={() => {
              if (item.handleFunc) {
                item.handleFunc();
              }
              handleClose();
            }}>
            {item.name}
          </MenuItem>
        ))}
      </Menu>,
    );
  }

  return (
    <>
      {actionTableJSX}
      <MaterialTable
        columns={columnStruct}
        data={tableData || []}
        icons={tableIcons}
        onRowClick={(event, rowData) =>
          onRowClick ? onRowClick(rowData, rowData.tableData.id) : null
        }
        actions={
          props.menuItems?.length
            ? [
                ...(props.actions ? props.actions : []),
                {
                  icon: () => <MoreVertIcon />,
                  tooltip: 'Actions',
                  onClick: handleClick,
                },
              ]
            : props.actions
        }
        options={{
          actionsColumnIndex: -1,
          filtering: true,
          // hide table title and toolbar
          toolbar: false,
        }}
        localization={{
          // hide 'Actions' in table header
          header: {actions: ''},
        }}
      />
    </>
  );
}

export function toLabels(obj: {}): Labels {
  if (!obj) {
    return {};
  }
  return Object.keys(obj).reduce((map, key) => {
    map[key] = obj[key];
    return map;
  }, {});
}
