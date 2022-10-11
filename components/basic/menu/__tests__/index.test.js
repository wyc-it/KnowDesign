import {
  AppstoreOutlined,
  InboxOutlined,
  MailOutlined,
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
// import { mount } from 'enzyme';
import React, { useState } from 'react';
import Menu from '..';
import mountTest from '../../../../tests/shared/mountTest';
import rtlTest from '../../../../tests/shared/rtlTest';
import { fireEvent, render, act } from '../../../../tests/utils';
import Layout from '../../layout';
import collapseMotion from '../../_util/motion';
import { noop } from '../../_util/warning';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { SubMenu } = Menu;

describe('Menu', () => {
  function triggerAllTimer() {
    for (let i = 0; i < 10; i += 1) {
      act(() => {
        jest.runAllTimers();
      });
    }
  }

  const expectSubMenuBehavior = (defaultProps, instance, enter = noop, leave = noop) => {
    const { container } = instance;

    expect(container.querySelectorAll('ul.dcloud-menu-sub')).toHaveLength(0);
    const AnimationClassNames = {
      horizontal: 'dcloud-slide-up-leave',
      inline: 'dcloud-motion-collapse-leave',
      vertical: 'dcloud-zoom-big-leave',
    };
    const mode = defaultProps.mode || 'horizontal';

    act(() => {
      enter();
    });

    // React concurrent may delay creat this
    triggerAllTimer();

    function getSubMenu() {
      if (mode === 'inline') {
        return container.querySelector('ul.dcloud-menu-sub.dcloud-menu-inline');
      }
      return container.querySelector('div.dcloud-menu-submenu-popup');
    }

    expect(
      getSubMenu().classList.contains('dcloud-menu-hidden') ||
      getSubMenu().classList.contains(AnimationClassNames[mode]),
    ).toBeFalsy();

    act(() => {
      leave();
    });

    // React concurrent may delay creat this
    triggerAllTimer();

    if (getSubMenu()) {
      expect(
        getSubMenu().classList.contains('dcloud-menu-hidden') ||
        getSubMenu().classList.contains(AnimationClassNames[mode]),
      ).toBeTruthy();
    }
  };

  // window.requestAnimationFrame = callback => window.setTimeout(callback, 16);
  // window.cancelAnimationFrame = window.clearTimeout;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  mountTest(() => (
    <Menu>
      <Menu.Item />
      <Menu.ItemGroup />
      <Menu.SubMenu />
    </Menu>
  ));

  mountTest(() => (
    <Menu>
      <Menu.Item />
      <>
        <Menu.ItemGroup />
        <Menu.SubMenu />
        {null}
      </>
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>
        <Menu.Item />
      </>
      {undefined}
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <>
          <Menu.Item />
        </>
      </>
    </Menu>
  ));

  rtlTest(() => (
    <Menu>
      <Menu.Item />
      <Menu.ItemGroup />
      <Menu.SubMenu />
    </Menu>
  ));

  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    document.body.removeChild(div);
  });

  it('If has select nested submenu item ,the menu items on the grandfather level should be highlight', () => {
    const { container } = render(
      <Menu defaultSelectedKeys={['1-3-2']} mode="vertical">
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="1-1">Option 1</Menu.Item>
          <Menu.Item key="1-2">Option 2</Menu.Item>
          <SubMenu key="1-3" title="submenu1-3">
            <Menu.Item key="1-3-1">Option 3</Menu.Item>
            <Menu.Item key="1-3-2">Option 4</Menu.Item>
          </SubMenu>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>,
    );
    expect(container.querySelectorAll('li.dcloud-menu-submenu-selected').length).toBe(1);
  });

  it('forceSubMenuRender', () => {
    const { container, rerender } = render(
      <Menu mode="horizontal">
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="1-1">
            <span className="bamboo" />
          </Menu.Item>
        </SubMenu>
      </Menu>,
    );

    expect(container.querySelector('.bamboo')).toBeFalsy();

    rerender(
      <Menu mode="horizontal" forceSubMenuRender>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="1-1">
            <span className="bamboo" />
          </Menu.Item>
        </SubMenu>
      </Menu>,
    );
    expect(container.querySelector('.bamboo')).toBeTruthy();
  });

  it('should accept defaultOpenKeys in mode horizontal', () => {
    const { container } = render(
      <Menu defaultOpenKeys={['1']} mode="horizontal">
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>,
    );

    expect(
      container.querySelector('.dcloud-menu-submenu-open').querySelector('.dcloud-menu-submenu-title')
        .textContent,
    ).toEqual('submenu1');
  });

  it('should accept defaultOpenKeys in mode inline', () => {
    const { container } = render(
      <Menu defaultOpenKeys={['1']} mode="inline">
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>,
    );

    expect(
      container.querySelector('.dcloud-menu-submenu-open').querySelector('.dcloud-menu-submenu-title')
        .textContent,
    ).toEqual('submenu1');
  });

  it('should accept defaultOpenKeys in mode vertical', () => {
    const { container } = render(
      <Menu defaultOpenKeys={['1']} mode="vertical">
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>,
    );
    expect(container.querySelector('.dcloud-menu-sub')).toBeFalsy();
  });

  it('should accept openKeys in mode horizontal', () => {
    const { container } = render(
      <Menu openKeys={['1']} mode="horizontal">
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>,
    );
    triggerAllTimer();
    expect(container.querySelector('div.dcloud-menu-submenu-popup')).not.toHaveClass(
      'dcloud-menu-submenu-hidden',
    );
  });

  it('should accept openKeys in mode inline', () => {
    const { container } = render(
      <Menu openKeys={['1']} mode="inline">
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>,
    );
    expect(container.querySelector('ul.dcloud-menu-sub')).not.toHaveClass('dcloud-menu-hidden');
  });

  it('should accept openKeys in mode vertical', () => {
    const { container } = render(
      <Menu openKeys={['1']} mode="vertical">
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>,
    );
    triggerAllTimer();
    expect(container.querySelector('div.dcloud-menu-submenu-popup')).not.toHaveClass(
      'dcloud-menu-submenu-hidden',
    );
  });

  it('test submenu in mode horizontal', async () => {
    const defaultProps = {
      mode: 'horizontal',
    };

    const Demo = props => (
      <Menu {...defaultProps} {...props}>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>
    );

    const instance = render(<Demo />);

    expectSubMenuBehavior(
      defaultProps,
      instance,
      () => instance.rerender(<Demo openKeys={['1']} />),
      () => instance.rerender(<Demo openKeys={[]} />),
    );

    instance.rerender(<Demo openKeys={['1']} />);
  });

  it('test submenu in mode inline', () => {
    const defaultProps = { mode: 'inline' };

    const Demo = props => (
      <Menu {...defaultProps} {...props}>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>
    );
    const instance = render(<Demo />);
    expectSubMenuBehavior(
      defaultProps,
      instance,
      () => instance.rerender(<Demo openKeys={['1']} />),
      () => instance.rerender(<Demo openKeys={[]} />),
    );
  });

  it('test submenu in mode vertical', () => {
    const defaultProps = { mode: 'vertical', openTransitionName: '' };

    const Demo = props => (
      <Menu {...defaultProps} {...props}>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>
    );

    const instance = render(<Demo />);
    expectSubMenuBehavior(
      defaultProps,
      instance,
      () => instance.rerender(<Demo openKeys={['1']} />),
      () => instance.rerender(<Demo openKeys={[]} />),
    );
  });

  describe('allows the overriding of theme at the popup submenu level', () => {
    const menuModesWithPopupSubMenu = ['horizontal', 'vertical'];

    menuModesWithPopupSubMenu.forEach(menuMode => {
      it(`when menu is mode ${menuMode}`, () => {
        const { container } = render(
          <Menu mode={menuMode} openKeys={['1']} theme="dark">
            <SubMenu key="1" title="submenu1" theme="light">
              <Menu.Item key="submenu1">Option 1</Menu.Item>
              <Menu.Item key="submenu2">Option 2</Menu.Item>
            </SubMenu>
            <Menu.Item key="2">menu2</Menu.Item>
          </Menu>,
        );

        act(() => {
          jest.runAllTimers();
        });

        expect(container.querySelector('ul.dcloud-menu-root')).toHaveClass('dcloud-menu-dark');
        expect(container.querySelector('div.dcloud-menu-submenu-popup')).toHaveClass('dcloud-menu-light');
      });
    });
  });

  // https://github.com/ant-design/ant-design/pulls/4677
  // https://github.com/ant-design/ant-design/issues/4692
  // TypeError: Cannot read property 'indexOf' of undefined
  it('pr #4677 and issue #4692', () => {
    render(
      <Menu mode="horizontal">
        <SubMenu title="submenu">
          <Menu.Item key="1">menu1</Menu.Item>
          <Menu.Item key="2">menu2</Menu.Item>
        </SubMenu>
      </Menu>,
    );

    act(() => {
      jest.runAllTimers();
    });
    // just expect no error emit
  });

  it('should always follow openKeys when mode is switched', () => {
    const Demo = props => (
      <Menu openKeys={['1']} mode="inline" {...props}>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
          <Menu.Item key="submenu2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="2">menu2</Menu.Item>
      </Menu>
    );

    const { container, rerender } = render(<Demo />);
    expect(container.querySelector('ul.dcloud-menu-sub')).not.toHaveClass('dcloud-menu-hidden');

    rerender(<Demo mode="vertical" />);
    expect(container.querySelector('ul.dcloud-menu-sub')).not.toHaveClass('dcloud-menu-hidden');

    rerender(<Demo mode="inline" />);
    expect(container.querySelector('ul.dcloud-menu-sub')).not.toHaveClass('dcloud-menu-hidden');
  });

  it('should always follow openKeys when inlineCollapsed is switched', () => {
    const Demo = props => (
      <Menu defaultOpenKeys={['1']} mode="inline" {...props}>
        <Menu.Item key="menu1" icon={<InboxOutlined />}>
          Option
        </Menu.Item>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option</Menu.Item>
          <Menu.Item key="submenu2">Option</Menu.Item>
        </SubMenu>
      </Menu>
    );
    const { container, rerender } = render(<Demo />);

    expect(container.querySelector('li.dcloud-menu-submenu-inline')).toHaveClass(
      'dcloud-menu-submenu-open',
    );
    // inlineCollapsed
    rerender(<Demo inlineCollapsed />);

    act(() => {
      jest.runAllTimers();
    });

    expect(container.querySelector('ul.dcloud-menu-root')).toHaveClass('dcloud-menu-vertical');
    expect(container.querySelector('.dcloud-menu-submenu-popup')).toBeFalsy();

    // !inlineCollapsed
    rerender(<Demo inlineCollapsed={false} />);

    act(() => {
      jest.runAllTimers();
    });

    expect(container.querySelector('ul.dcloud-menu-sub')).toHaveClass('dcloud-menu-inline');
    expect(container.querySelector('li.dcloud-menu-submenu-inline')).toHaveClass(
      'dcloud-menu-submenu-open',
    );
  });

  it('inlineCollapsed should works well when specify a not existed default openKeys', () => {
    const Demo = props => (
      <Menu defaultOpenKeys={['not-existed']} mode="inline" {...props}>
        <Menu.Item key="menu1" icon={<InboxOutlined />}>
          Option
        </Menu.Item>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option</Menu.Item>
          <Menu.Item key="submenu2">Option</Menu.Item>
        </SubMenu>
      </Menu>
    );
    const { container, rerender } = render(<Demo />);

    expect(container.querySelectorAll('.dcloud-menu-sub')).toHaveLength(0);

    rerender(<Demo inlineCollapsed />);
    act(() => {
      jest.runAllTimers();
    });

    const transitionEndEvent = new Event('transitionend');
    fireEvent(container.querySelector('ul'), transitionEndEvent);
    act(() => {
      jest.runAllTimers();
    });

    fireEvent.mouseEnter(container.querySelector('.dcloud-menu-submenu-title'));
    triggerAllTimer();

    expect(container.querySelector('.dcloud-menu-submenu')).toHaveClass('dcloud-menu-submenu-vertical');
    expect(container.querySelector('.dcloud-menu-submenu')).toHaveClass('dcloud-menu-submenu-open');
    expect(container.querySelector('ul.dcloud-menu-sub')).toHaveClass('dcloud-menu-vertical');
    expect(container.querySelector('ul.dcloud-menu-sub')).not.toHaveClass('dcloud-menu-hidden');
  });

  it('inlineCollapsed Menu.Item Tooltip can be removed', () => {
    const { container } = render(
      <Menu
        defaultOpenKeys={['not-existed']}
        mode="inline"
        inlineCollapsed
        getPopupContainer={node => node.parentNode}
      >
        <Menu.Item key="menu1">item</Menu.Item>
        <Menu.Item key="menu2" title="title">
          item
        </Menu.Item>
        <Menu.Item key="menu3" title={undefined}>
          item
        </Menu.Item>
        <Menu.Item key="menu4" title={null}>
          item
        </Menu.Item>
        <Menu.Item key="menu5" title="">
          item
        </Menu.Item>
        <Menu.Item key="menu6" title={false}>
          item
        </Menu.Item>
      </Menu>,
    );
    fireEvent.mouseEnter(container.querySelectorAll('li.dcloud-menu-item')[0]);
    fireEvent.mouseEnter(container.querySelectorAll('li.dcloud-menu-item')[1]);
    fireEvent.mouseEnter(container.querySelectorAll('li.dcloud-menu-item')[2]);
    fireEvent.mouseEnter(container.querySelectorAll('li.dcloud-menu-item')[3]);
    fireEvent.mouseEnter(container.querySelectorAll('li.dcloud-menu-item')[4]);
    fireEvent.mouseEnter(container.querySelectorAll('li.dcloud-menu-item')[5]);

    triggerAllTimer();
    // when title is null or '' and false, tooltip will not render.
    expect(container.querySelectorAll('.dcloud-tooltip-inner').length).toBe(3);
    expect(container.querySelectorAll('.dcloud-tooltip-inner')[0].textContent).toBe('item');
    expect(container.querySelectorAll('.dcloud-tooltip-inner')[1].textContent).toBe('title');
    expect(container.querySelectorAll('.dcloud-tooltip-inner')[2].textContent).toBe('item');
  });

  describe('open submenu when click submenu title', () => {
    const toggleMenu = (instance, index, event) => {
      fireEvent[event](instance.container.querySelectorAll('.dcloud-menu-submenu-title')[index]);

      triggerAllTimer();
    };

    it('inline', () => {
      const defaultProps = { mode: 'inline' };

      const Demo = props => (
        <Menu {...defaultProps} {...props}>
          <SubMenu key="1" title="submenu1">
            <Menu.Item key="submenu1">Option 1</Menu.Item>
            <Menu.Item key="submenu2">Option 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="2">menu2</Menu.Item>
        </Menu>
      );

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'click'),
        () => toggleMenu(instance, 0, 'click'),
      );
    });

    it('inline menu collapseMotion should be triggered', async () => {
      const cloneMotion = {
        ...collapseMotion,
        motionDeadline: 1,
      };

      const onOpenChange = jest.fn();
      const onEnterEnd = jest.spyOn(cloneMotion, 'onEnterEnd');

      const { container } = render(
        <Menu mode="inline" motion={cloneMotion} onOpenChange={onOpenChange}>
          <SubMenu key="1" title="submenu1">
            <Menu.Item key="submenu1">Option 1</Menu.Item>
            <Menu.Item key="submenu2">Option 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="2">menu2</Menu.Item>
        </Menu>,
      );

      fireEvent.click(container.querySelector('.dcloud-menu-submenu-title'));

      triggerAllTimer();

      expect(onOpenChange).toHaveBeenCalled();
      expect(onEnterEnd).toHaveBeenCalledTimes(1);
    });

    it('vertical with hover(default)', () => {
      const defaultProps = { mode: 'vertical' };

      const Demo = () => (
        <Menu {...defaultProps}>
          <SubMenu key="1" title="submenu1">
            <Menu.Item key="submenu1">Option 1</Menu.Item>
            <Menu.Item key="submenu2">Option 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="2">menu2</Menu.Item>
        </Menu>
      );

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'mouseEnter'),
        () => toggleMenu(instance, 0, 'mouseLeave'),
      );
    });

    it('vertical with click', () => {
      const defaultProps = { mode: 'vertical', triggerSubMenuAction: 'click' };
      const Demo = () => (
        <Menu {...defaultProps}>
          <SubMenu key="1" title="submenu1">
            <Menu.Item key="submenu1">Option 1</Menu.Item>
            <Menu.Item key="submenu2">Option 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="2">menu2</Menu.Item>
        </Menu>
      );

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'click'),
        () => toggleMenu(instance, 0, 'click'),
      );
    });

    it('horizontal with hover(default)', () => {
      const defaultProps = { mode: 'horizontal' };
      const Demo = () => (
        <Menu {...defaultProps}>
          <SubMenu key="1" title="submenu1">
            <Menu.Item key="submenu1">Option 1</Menu.Item>
            <Menu.Item key="submenu2">Option 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="2">menu2</Menu.Item>
        </Menu>
      );

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'mouseEnter'),
        () => toggleMenu(instance, 0, 'mouseLeave'),
      );
    });

    it('horizontal with click', () => {
      const defaultProps = { mode: 'horizontal', triggerSubMenuAction: 'click' };
      const Demo = () => (
        <Menu {...defaultProps}>
          <SubMenu key="1" title="submenu1">
            <Menu.Item key="submenu1">Option 1</Menu.Item>
            <Menu.Item key="submenu2">Option 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="2">menu2</Menu.Item>
        </Menu>
      );

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'click'),
        () => toggleMenu(instance, 0, 'click'),
      );
    });
  });

  it('inline title', () => {
    const { container } = render(
      <Menu mode="inline" inlineCollapsed>
        <Menu.Item key="1" title="bamboo lucky" icon={<PieChartOutlined />}>
          Option 1
          <img
            style={{ width: 20 }}
            alt="test"
            src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          />
        </Menu.Item>
      </Menu>,
    );
    fireEvent.mouseEnter(container.querySelector('.dcloud-menu-item'));
    triggerAllTimer();

    expect(container.querySelector('.dcloud-tooltip-inner').textContent).toBe('bamboo lucky');
  });

  it('render correctly when using with Layout.Sider', () => {
    class Demo extends React.Component {
      state = {
        collapsed: false,
      };

      onCollapse = collapsed => this.setState({ collapsed });

      render() {
        const { collapsed } = this.state;
        return (
          <Layout style={{ minHeight: '100vh' }}>
            <Layout.Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
              <div className="logo" />
              <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                <SubMenu key="sub1" icon={<UserOutlined />} title="User">
                  <Menu.Item key="3">Tom</Menu.Item>
                  <Menu.Item key="4">Bill</Menu.Item>
                  <Menu.Item key="5">Alex</Menu.Item>
                </SubMenu>
              </Menu>
            </Layout.Sider>
          </Layout>
        );
      }
    }
    const { container } = render(<Demo />);

    expect(container.querySelector('ul.dcloud-menu-root')).toHaveClass('dcloud-menu-inline');

    fireEvent.click(container.querySelector('.dcloud-menu-submenu-title'));
    fireEvent.click(container.querySelector('.dcloud-layout-sider-trigger'));
    triggerAllTimer();
    expect(container.querySelector('ul.dcloud-menu-root')).toHaveClass('dcloud-menu-inline-collapsed');

    fireEvent.mouseEnter(container.querySelector('ul.dcloud-menu-root'));
    expect(container.querySelector('ul.dcloud-menu-root')).not.toHaveClass('dcloud-menu-inline');
    expect(container.querySelector('ul.dcloud-menu-root')).toHaveClass('dcloud-menu-vertical');
  });

  it('onMouseEnter should work', () => {
    const onMouseEnter = jest.fn();
    const { container } = render(
      <Menu onMouseEnter={onMouseEnter} defaultSelectedKeys={['test1']}>
        <Menu.Item key="test1">Navigation One</Menu.Item>
        <Menu.Item key="test2">Navigation Two</Menu.Item>
      </Menu>,
    );
    fireEvent.mouseEnter(container.querySelector('ul.dcloud-menu-root'));
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it('MenuItem should not render Tooltip when inlineCollapsed is false', () => {
    const { container } = render(
      <Menu defaultSelectedKeys={['mail']} defaultOpenKeys={['mail']} mode="horizontal">
        <Menu.Item key="mail" icon={<MailOutlined />}>
          Navigation One
        </Menu.Item>
        <Menu.Item key="app" icon={<AppstoreOutlined />}>
          Navigation Two
        </Menu.Item>
        <Menu.Item key="alipay">
          <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
            Navigation Four - Link
          </a>
        </Menu.Item>
      </Menu>,
      { attachTo: div },
    );

    fireEvent.mouseEnter(container.querySelector('li.dcloud-menu-item'));
    act(() => {
      jest.runAllTimers();
    });

    expect(container.querySelectorAll('.dcloud-tooltip-inner').length).toBe(0);
  });

  it('MenuItem should render icon and icon should be the first child when icon exists', () => {
    const { container } = render(
      <Menu>
        <Menu.Item key="mail" icon={<MailOutlined />}>
          Navigation One
        </Menu.Item>
      </Menu>,
    );
    expect(container.querySelector('.dcloud-menu-item .anticon')).toHaveClass('anticon-mail');
  });

  it('should controlled collapse work', () => {
    const { asFragment, rerender } = render(
      <Menu mode="inline" inlineCollapsed={false}>
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          Option 1
        </Menu.Item>
      </Menu>,
    );

    expect(asFragment()).toMatchSnapshot();

    rerender(
      <Menu mode="inline" inlineCollapsed>
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          Option 1
        </Menu.Item>
      </Menu>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('not title if not collapsed', () => {
    jest.useFakeTimers();
    const { container } = render(
      <Menu mode="inline" inlineCollapsed={false}>
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          Option 1
        </Menu.Item>
      </Menu>,
    );
    fireEvent.mouseEnter(container.querySelector('.dcloud-menu-item'));
    act(() => {
      jest.runAllTimers();
    });

    expect(container.querySelectorAll('.dcloud-tooltip-inner').length).toBeFalsy();

    jest.useRealTimers();
  });

  it('props#onOpen and props#onClose do not warn anymore', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    const onOpen = jest.fn();
    const onClose = jest.fn();
    render(
      <Menu
        defaultOpenKeys={['1']}
        mode="inline"
        onOpen={onOpen}
        onClose={onClose}
        items={[
          {
            key: '1',
            label: 'submenu1',
            children: [
              { key: 'submenu1', label: 'Option 1' },
              { key: 'submenu2', label: 'Option 2' },
            ],
          },
          { key: '2', label: 'menu2' },
        ]}
      />,
    );

    expect(errorSpy.mock.calls.length).toBe(1);
    expect(errorSpy.mock.calls[0][0]).not.toContain(
      '`onOpen` and `onClose` are removed, please use `onOpenChange` instead, see: https://u.dcloud.design/menu-on-open-change.',
    );
    expect(onOpen).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // https://github.com/ant-design/ant-design/issues/18825
  // https://github.com/ant-design/ant-design/issues/8587
  it('should keep selectedKeys in state when collapsed to 0px', () => {
    jest.useFakeTimers();
    const Demo = props => (
      <Menu
        mode="inline"
        inlineCollapsed={false}
        defaultSelectedKeys={['1']}
        collapsedWidth={0}
        openKeys={['3']}
        {...props}
      >
        <Menu.Item key="1">Option 1</Menu.Item>
        <Menu.Item key="2">Option 2</Menu.Item>
        <Menu.SubMenu key="3" title="Option 3">
          <Menu.Item key="4">Option 4</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );

    const { container, rerender } = render(<Demo />);
    expect(container.querySelector('li.dcloud-menu-item-selected').textContent).toBe('Option 1');
    fireEvent.click(container.querySelectorAll('li.dcloud-menu-item')[1]);
    expect(container.querySelector('li.dcloud-menu-item-selected').textContent).toBe('Option 2');

    rerender(<Demo inlineCollapsed />);
    act(() => {
      jest.runAllTimers();
    });
    expect(container.querySelector('li.dcloud-menu-item-selected').textContent).toBe('O');

    rerender(<Demo inlineCollapsed={false} />);

    expect(container.querySelector('li.dcloud-menu-item-selected').textContent).toBe('Option 2');
    jest.useRealTimers();
  });

  it('Menu.Item with icon children auto wrap span', () => {
    const { asFragment } = render(
      <Menu>
        <Menu.Item key="1" icon={<MailOutlined />}>
          Navigation One
        </Menu.Item>
        <Menu.Item key="2" icon={<MailOutlined />}>
          <span>Navigation One</span>
        </Menu.Item>
        <Menu.SubMenu key="3" icon={<MailOutlined />} title="Navigation One" />
        <Menu.SubMenu key="4" icon={<MailOutlined />} title={<span>Navigation One</span>} />
      </Menu>,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  // https://github.com/ant-design/ant-design/issues/23755
  it('should trigger onOpenChange when collapse inline menu', () => {
    const onOpenChange = jest.fn();
    function App() {
      const [inlineCollapsed, setInlineCollapsed] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setInlineCollapsed(!inlineCollapsed);
            }}
          >
            collapse menu
          </button>
          <Menu mode="inline" onOpenChange={onOpenChange} inlineCollapsed={inlineCollapsed}>
            <Menu.SubMenu key="1" title="menu">
              <Menu.Item key="1-1">menu</Menu.Item>
              <Menu.Item key="1-2">menu</Menu.Item>
            </Menu.SubMenu>
          </Menu>
        </>
      );
    }
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('button'));
    expect(onOpenChange).toHaveBeenCalledWith([]);
  });

  it('Use first char as Icon when collapsed', () => {
    const { container } = render(
      <Menu mode="inline" inlineCollapsed>
        <Menu.SubMenu title="Light" />
        <Menu.Item>Bamboo</Menu.Item>
      </Menu>,
    );

    expect(container.querySelectorAll('.dcloud-menu-inline-collapsed-noicon')[0].textContent).toEqual(
      'L',
    );
    expect(container.querySelectorAll('.dcloud-menu-inline-collapsed-noicon')[1].textContent).toEqual(
      'B',
    );
  });

  it('divider should show', () => {
    const { container } = render(
      <Menu mode="vertical">
        <SubMenu key="sub1" title="Navigation One">
          <Menu.Item key="1">Option 1</Menu.Item>
        </SubMenu>
        <Menu.Divider dashed />
        <SubMenu key="sub2" title="Navigation Two">
          <Menu.Item key="2">Option 2</Menu.Item>
        </SubMenu>
        <Menu.Divider />
        <SubMenu key="sub4" title="Navigation Three">
          <Menu.Item key="3">Option 3</Menu.Item>
        </SubMenu>
      </Menu>,
    );

    expect(container.querySelectorAll('li.dcloud-menu-item-divider').length).toBe(2);
    expect(container.querySelectorAll('li.dcloud-menu-item-divider-dashed').length).toBe(1);
  });

  it('should support ref', async () => {
    const ref = React.createRef();
    const { container } = render(
      <Menu ref={ref}>
        <Menu.Item key="1">Option 1</Menu.Item>
      </Menu>,
    );
    expect(ref.current?.menu?.list).toBe(container.querySelector('ul'));
    ref.current?.focus();
    expect(document.activeElement).toBe(container.querySelector('li'));
  });

  it('expandIcon', () => {
    const { container } = render(
      <Menu defaultOpenKeys={['1']} mode="inline" expandIcon={() => <span className="bamboo" />}>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option 1</Menu.Item>
        </SubMenu>
      </Menu>,
    );

    expect(container.querySelector('.bamboo')).toBeTruthy();
  });

  it('all types must be available in the "items" syntax', () => {
    const { asFragment } = render(
      <Menu
        mode="inline"
        defaultOpenKeys={['submenu', 'group-submenu']}
        items={[
          {
            key: 'submenu',
            label: 'Submenu',
            children: [
              { key: 'submenu-item1', label: 'SubmenuItem 1' },
              { key: 'submenu-item2', label: 'SubmenuItem 2' },
            ],
          },
          { key: 'divider', type: 'divider' },
          {
            key: 'group',
            type: 'group',
            label: 'Group',
            children: [
              {
                key: 'group-item',
                label: 'GroupItem',
              },
              { key: 'group-divider', type: 'divider' },
              {
                key: 'group-submenu',
                label: 'GroupSubmenu',
                children: [
                  { key: 'group-submenu-item1', label: 'GroupSubmenuItem 1' },
                  { key: 'group-submenu-item2', label: 'GroupSubmenuItem 2' },
                ],
              },
            ],
          },
        ]}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should not warning deprecated message when items={undefined}', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Menu items={undefined} />);
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('`children` will be removed in next major version'),
    );
    errorSpy.mockRestore();
  });
});
