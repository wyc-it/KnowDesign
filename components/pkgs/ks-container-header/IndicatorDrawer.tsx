import React, { useState, useEffect } from "react";
import { Drawer, Button, Table } from '../../index';
import { IindicatorSelectModule } from './index';
import './style/indicator-drawer.less';
interface propsType extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void;
  onSure: (value: any[]) => void;
  visible: boolean;
  isGroup?: boolean; // 是否分组
  indicatorSelectModule: IindicatorSelectModule
}

const IndicatorDrawer: React.FC<propsType> = ({
  onClose,
  onSure,
  visible,
  indicatorSelectModule
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>(indicatorSelectModule?.selectedRows || []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name'
    },
    {
      title: '单位',
      dataIndex: 'unit'
    },
    {
      title: '描述',
      dataIndex: 'desc'
    }
  ]

  const onSelectChange = (val) => {
    setSelectedRowKeys(val);
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const sure = () => {
    onSure(selectedRowKeys);
  }

  return (
    <>
      <Drawer
        title={indicatorSelectModule.drawerTitle || "指标筛选"}
        width="868px"
        className={"dd-indicator-drawer "}
        forceRender={true}
        onClose={onClose}
        visible={visible}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <Button
              type="primary"
              style={{ marginRight: '8px', marginLeft: '8px' }}
              onClick={() => sure()}
            >
              确认
            </Button>
            <Button onClick={onClose}>取消</Button>
          </div>
        }
      >
        
        <Table 
          pagination={false}
          columns={columns}
          rowSelection={rowSelection}
          dataSource={indicatorSelectModule?.tableData || []}
          rowClassName={(r, i) => {
            return i % 2 === 0 ? '' : 'line-fill-color'
          }} />

      </Drawer>
    </>
  )

};

export default IndicatorDrawer;