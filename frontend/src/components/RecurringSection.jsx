import { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Switch, Popconfirm, Typography, Empty } from 'antd';
import { ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getRecurring, updateRecurring, deleteRecurring } from '../api';

const { Text } = Typography;
const FREQ_LABEL = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

export default function RecurringSection({ onAddRecurringRef }) {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getRecurring({ userId: user?.id })
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const toggleActive = async (item) => {
    try {
      await updateRecurring(item.id, { is_active: !item.is_active });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id) => {
    try {
      await deleteRecurring(id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="recurring-section"
      data-tour="recurring"
    >
      <Card
        title="Recurring expenses"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => onAddRecurringRef?.current?.()}>
            Add recurring
          </Button>
        }
        loading={loading}
      >
        {!items.length ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No recurring expenses. Add rent, subscriptions, etc."
            style={{ padding: '24px 0' }}
          >
            <Button type="primary" ghost onClick={() => onAddRecurringRef?.current?.()}>
              Add one
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={items}
            renderItem={(item) => (
              <AnimatePresence key={item.id}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="recurring-item"
                >
                  <List.Item
                    actions={[
                      <Switch
                        key="switch"
                        checked={item.is_active}
                        onChange={() => toggleActive(item)}
                        size="small"
                      />,
                      <Popconfirm
                        key="del"
                        title="Remove this recurring expense?"
                        onConfirm={() => remove(item.id)}
                        okText="Remove"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{item.title}</span>
                          {item.category_name && (
                            <Tag color={item.category_color || 'default'}>{item.category_name}</Tag>
                          )}
                          <Tag>{FREQ_LABEL[item.frequency] || item.frequency}</Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary">
                          ₹{Number(item.amount).toLocaleString('en-IN')} · Next: {dayjs(item.next_due).format('DD MMM')}
                        </Text>
                      }
                    />
                  </List.Item>
                </motion.div>
              </AnimatePresence>
            )}
          />
        )}
      </Card>
    </motion.div>
  );
}
