import { useState } from 'react';
import { Button, Tag, Empty, Popconfirm, Space, Typography, Segmented, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

const { Text } = Typography;

function parseTags(tags) {
  if (!tags || typeof tags !== 'string') return [];
  return tags.split(',').map((t) => t.trim()).filter(Boolean);
}

function groupByDate(expenses) {
  const groups = {};
  expenses.forEach((e) => {
    const key = e.expense_date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function ExpenseCard({ item, index, onEdit, onDelete }) {
  const tags = parseTags(item.tags);
  const categoryEmoji = item.category_icon || '📌';
  const categoryColor = item.category_color || '#636e72';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.02, duration: 0.25 }}
      className="expense-card-new"
    >
      <div className="expense-card-inner">
        <div className="expense-card-left">
          <span
            className="expense-card-emoji"
            style={{ background: `${categoryColor}22`, color: categoryColor }}
            title={item.category_name}
          >
            {categoryEmoji}
          </span>
          <div className="expense-card-body">
            <span className="expense-card-title">{item.title}</span>
            {(item.note || tags.length > 0) && (
              <div className="expense-card-meta">
                {item.note && (
                  <Text type="secondary" className="expense-card-note" ellipsis>
                    {item.note}
                  </Text>
                )}
                {tags.length > 0 && (
                  <Space size={[4, 4]} wrap className="expense-card-tags">
                    {tags.map((t) => (
                      <Tag key={t} className="expense-tag-pill">{t}</Tag>
                    ))}
                  </Space>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="expense-card-right">
          <span className="expense-card-amount">₹{Number(item.amount).toLocaleString('en-IN')}</span>
          <Space size={4} className="expense-card-actions">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(item)}
              className="action-btn"
              aria-label="Edit"
            />
            <Popconfirm
              title="Delete this expense?"
              onConfirm={() => onDelete(item.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} className="action-btn" aria-label="Delete" />
            </Popconfirm>
          </Space>
        </div>
      </div>
    </motion.div>
  );
}

function ExpenseRow({ item, index, onEdit, onDelete }) {
  const tags = parseTags(item.tags);
  const categoryEmoji = item.category_icon || '📌';
  const categoryColor = item.category_color || '#636e72';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.02 }}
      className="expense-row-new"
    >
      <span className="expense-row-emoji" style={{ color: categoryColor }}>{categoryEmoji}</span>
      <div className="expense-row-main">
        <span className="expense-row-title">{item.title}</span>
        <div className="expense-row-meta">
          {item.category_name && <Tag color={categoryColor}>{item.category_name}</Tag>}
          {tags.slice(0, 3).map((t) => (
            <Tag key={t} className="tag-pill">{t}</Tag>
          ))}
          {item.note && <Text type="secondary" ellipsis style={{ maxWidth: 140 }}>{item.note}</Text>}
        </div>
      </div>
      <span className="expense-row-amount">₹{Number(item.amount).toLocaleString('en-IN')}</span>
      <Space size={0} className="expense-row-actions">
        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(item)} aria-label="Edit" />
        <Popconfirm title="Delete?" onConfirm={() => onDelete(item.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
          <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label="Delete" />
        </Popconfirm>
      </Space>
    </motion.div>
  );
}

export default function ExpenseList({ expenses, loading, onEdit, onDelete, onAddClickRef }) {
  const [view, setView] = useState('cards'); // 'cards' | 'list'
  const grouped = groupByDate(expenses || []);

  if (!expenses?.length && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="expense-list-empty"
        data-tour="expense-list"
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No expenses yet. Add your first one!"
          style={{ padding: '48px 0' }}
        >
          <Button type="primary" size="large" onClick={() => (onAddClickRef?.current ? onAddClickRef.current() : null)}>
            Add expense
          </Button>
        </Empty>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="expense-list-v2 expense-list-loading" data-tour="expense-list">
        <div className="expense-list-toolbar">
          <Segmented value={view} options={[{ value: 'cards', label: 'Cards' }, { value: 'list', label: 'List' }]} disabled />
        </div>
        <div className="expense-list-content" style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Spin size="large" tip="Loading expenses..." />
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list-v2" data-tour="expense-list">
      <div className="expense-list-toolbar">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'cards', label: <><AppstoreOutlined /> Cards</> },
            { value: 'list', label: <><UnorderedListOutlined /> List</> },
          ]}
        />
      </div>
      <div className="expense-list-content">
        {grouped.map(([dateKey, dayExpenses]) => (
          <div key={dateKey} className="expense-date-group">
            <motion.div
              className="expense-date-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="date-label">
                {dayjs(dateKey).format('dddd, D MMM YYYY')}
              </span>
              <span className="date-total">
                ₹{dayExpenses.reduce((s, e) => s + Number(e.amount), 0).toLocaleString('en-IN')}
              </span>
            </motion.div>
            <AnimatePresence mode="popLayout">
              {view === 'cards' ? (
                <div className="expense-cards-grid">
                  {dayExpenses.map((item, i) => (
                    <ExpenseCard
                      key={item.id}
                      item={item}
                      index={i}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="expense-rows">
                  {dayExpenses.map((item, i) => (
                    <ExpenseRow
                      key={item.id}
                      item={item}
                      index={i}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
