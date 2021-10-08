import React, { FC } from 'react';
import { createRegion } from 'region-core';
import { get, groupBy } from 'lodash';
import { Menu, Layout } from '../components';
import history from './history';
import routes from './routes';
import External from './External';
import styles from './AppLayout.module.css';

const initSelectedKey = () => {
  const { hash } = history.location;
  const initSelectKey = hash !== '' ? hash.slice(1) : null;
  const defaultSelectKey = get(routes, ['0', 'key']);
  if (!initSelectKey || routes.find(({ key }) => key === initSelectKey) === undefined) {
    return defaultSelectKey;
  }
  return initSelectKey;
};

const selectedKeyRegion = createRegion(initSelectedKey());

const defaultSelectKey = get(routes, ['0', 'key']);

const onClick = ({ key }: any) => {
  history.replace(`#${key}`);
  selectedKeyRegion.set(key);
};

const MenuItem = ({ key, label }: any) => <Menu.Item key={key}>{label}</Menu.Item>;

const getMenuElements = () => {
  const routeGroups = groupBy(routes, 'groupName');

  return Object.entries(routeGroups).map(([groupName, routeList]) => {
    const routeElements = routeList.map(MenuItem);
    if (routeList.length === 1) {
      return routeElements;
    }
    return (
      <Menu.SubMenu key={groupName} title={groupName} >
        {routeElements}
      </Menu.SubMenu>
    );
  });
  // routes.map(MenuItem);
};

const menuElements = getMenuElements();

const AppLayout: FC = () => {
  const selectedKey = selectedKeyRegion.useValue();
  const route = routes.find(({ key }) => key === selectedKey);
  if (!route) {
    selectedKeyRegion.set(defaultSelectKey);
    return null;
  }
  const { Component, groupName } = route;
  return (
    <Layout className={styles.container}>
      <Layout.Sider className={styles.sider}>
        <Menu
          mode="inline"
          defaultOpenKeys={[groupName]}
          selectedKeys={[selectedKey]}
          onClick={onClick}
          style={{ minHeight: '100%', borderRight: '1px solid #e8e8e8' }}
        >
          {menuElements}
        </Menu>
      </Layout.Sider>
      <Layout.Content>
        <Component />
        {selectedKey !== 'GetStarted' && <External selectedKey={selectedKey} />}
      </Layout.Content>
    </Layout>
  );
};

export default AppLayout;
