import { useRef, useState } from 'react';
import { Layout as AntLayout, Button, Dropdown, Space } from 'antd';
import { PlusOutlined, BulbOutlined, MenuOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import AppTour from './AppTour';
import AddExpenseModal from './AddExpenseModal';
import AddRecurringModal from './AddRecurringModal';

const { Header, Content } = AntLayout;
const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  ocean: 'Ocean',
  forest: 'Forest',
  sunset: 'Sunset',
};

export default function Layout({ children, onExpenseAdded, onRecurringAdded }) {
  const { themeName, setThemeName, themes } = useTheme();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const addBtnRef = useRef(null);
  const addRecurringRef = useRef(null);

  const openRecurring = () => setRecurringModalOpen(true);
  if (addRecurringRef.current !== openRecurring) addRecurringRef.current = openRecurring;

  const themeMenu = {
    items: themes.map((t) => ({
      key: t,
      label: themeLabels[t] || t,
      onClick: () => setThemeName(t),
    })),
  };

  return (
    <AntLayout className="app-layout">
      <Header className="app-header">
        <motion.div
          className="header-brand"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="logo-icon">◆</span>
          <span className="logo-text">SplitSmart</span>
        </motion.div>
        <Space size="middle" className="header-actions">
          <Button
            ref={addBtnRef}
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
            className="add-expense-btn"
            data-tour="add-expense"
          >
            Add expense
          </Button>
          <Button
            icon={<BulbOutlined />}
            onClick={() => setTourOpen(true)}
            title="Show tour again"
          >
            Tour
          </Button>
          <Dropdown menu={themeMenu} placement="bottomRight" trigger={['click']}>
            <Button icon={<MenuOutlined />}>{themeLabels[themeName] || themeName}</Button>
          </Dropdown>
        </Space>
      </Header>
      <Content className="app-content">{children({ setAddModalOpen, addBtnRef, addRecurringRef, openAddModal: () => setAddModalOpen(true) })}</Content>

      <AddExpenseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => { onExpenseAdded?.(); }}
      />
      <AddRecurringModal
        open={recurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        onSuccess={() => { onRecurringAdded?.(); }}
      />
      <AppTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </AntLayout>
  );
}
