import React from 'react';
import { Layout } from '../../index';
import { SiderProps } from '../../basic/layout';
import MenuNav from '../d-layout/MenuNav';
import './style/sider.less';
import { useIntl } from 'react-intl';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

export interface ISiderProps extends SiderProps {
  systemKey: string;
  systemName?: string;
  menuConf: any;
  permissionPoints?: {[key: string]: any} | Function;
}

const { Sider } = Layout;

const DKMSider = (props: ISiderProps) => {
  const { prefixCls, collapsible = true, collapsedWidth, width, theme, menuConf, permissionPoints = {}, systemKey, systemName, style } = props;
  const cPrefixCls = `${prefixCls}-layout`;
  const intl = useIntl();
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  return (
    <>
      <Sider
        style={style}
        theme={theme}
        width={width || 180}
        collapsedWidth={collapsedWidth}
        className={`${cPrefixCls}-sider`}
        trigger={null}
        collapsible={collapsible}
        collapsed={collapsed}
      >
        <div className='menu-content'>
          <MenuNav
            theme={theme}
            iconFontSize={16}
            cPrefixCls={cPrefixCls}
            systemKey={systemKey}
            systemName={systemName}
            menuConf={menuConf}
            siderCollapsed={collapsed}
            permissionPoints={permissionPoints}
          />
        </div>
        <div className={`${cPrefixCls}-sider-footer`}  onClick={() => setCollapsed(!collapsed)}>
          <div className="line" />
          {!collapsed ? (
            <div className='content'>
              <MenuFoldOutlined className="icon" />
              <span className="text">{intl.formatMessage({ id: `sider.footer.hide` })}</span>
            </div>
          ) : (
            <div className='content'>
              <MenuUnfoldOutlined className="icon" />
            </div>
          )}
        </div>
      </Sider>
    </>
  );
};

export default DKMSider;
