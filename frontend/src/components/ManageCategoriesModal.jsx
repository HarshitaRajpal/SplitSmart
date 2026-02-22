import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

const EMOJI_OPTIONS = ['🍔', '🚗', '🛒', '💡', '🎬', '❤️', '✈️', '📚', '📌', '🏠', '☕', '🍕', '🎮', '💼', '🩺', '📱', '🎵', '🌿', '🐾', '⭐', '🎁', '💳', '🔧', '📦'];
const COLOR_OPTIONS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe', '#636e72', '#22c55e', '#f97316', '#0ea5e9', '#8b5cf6'];

export default function ManageCategoriesModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm] = Form.useForm();

  const load = () => {
    getCategories().then(setCategories).catch(() => message.error('Failed to load categories'));
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleAdd = async () => {
    try {
      const { name, icon, color } = await form.validateFields();
      setLoading(true);
      await createCategory({ name, icon: icon || '📌', color: color || '#636e72' });
      message.success('Category added');
      form.resetFields();
      load();
      onSuccess?.();
    } catch (e) {
      if (e.errorFields) return;
      message.error(e.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const v = editForm.getFieldsValue();
      await updateCategory(id, v);
      message.success('Updated');
      setEditingId(null);
      editForm.resetFields();
      load();
      onSuccess?.();
    } catch (e) {
      message.error(e.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success('Category removed');
      load();
      onSuccess?.();
    } catch (e) {
      message.error(e.message || 'Delete failed');
    }
  };

  return (
    <Modal
      title="Manage categories"
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <div className="manage-categories-add">
          <Form form={form} layout="vertical" onFinish={handleAdd}>
            <div className="add-category-row">
              <Form.Item name="name" rules={[{ required: true }]} style={{ marginBottom: 0, flex: 1 }}>
                <Input placeholder="Category name" size="large" />
              </Form.Item>
              <Form.Item name="icon" style={{ marginBottom: 0, width: 56 }}>
                <Select
                  placeholder=""
                  size="large"
                  options={EMOJI_OPTIONS.map((e) => ({ value: e, label: <span style={{ fontSize: 20 }}>{e}</span> }))}
                  allowClear
                />
              </Form.Item>
              <Form.Item name="color" style={{ marginBottom: 0, width: 56 }}>
                <Select
                  size="large"
                  options={COLOR_OPTIONS.map((c) => ({ value: c, label: <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 4, background: c }} /> }))}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} size="large" loading={loading}>
                Add
              </Button>
            </div>
          </Form>
        </div>
        <div className="manage-categories-list">
          {categories.map((cat) => (
              <AnimatePresence key={cat.id} mode="wait">
                {editingId === cat.id ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="category-edit-row"
                  >
                    <Form
                      form={editForm}
                      layout="inline"
                      onFinish={() => handleUpdate(cat.id)}
                      initialValues={{ name: cat.name, icon: cat.icon || '📌', color: cat.color || '#636e72' }}
                      style={{ flex: 1 }}
                    >
                      <Form.Item name="name" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                        <Input placeholder="Name" style={{ width: 140 }} />
                      </Form.Item>
                      <Form.Item name="icon" style={{ marginBottom: 0 }}>
                        <Select options={EMOJI_OPTIONS.map((e) => ({ value: e, label: e }))} style={{ width: 60 }} />
                      </Form.Item>
                      <Form.Item name="color" style={{ marginBottom: 0 }}>
                        <Select options={COLOR_OPTIONS.map((c) => ({ value: c, label: c }))} style={{ width: 70 }} />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" size="small">Save</Button>
                      <Button size="small" onClick={() => { setEditingId(null); editForm.resetFields(); }}>Cancel</Button>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="category-list-row"
                  >
                    <span className="category-emoji" style={{ background: `${cat.color}22`, color: cat.color }}>
                      {cat.icon || '📌'}
                    </span>
                    <span className="category-name">{cat.name}</span>
                    <Space>
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingId(cat.id); editForm.setFieldsValue({ name: cat.name, icon: cat.icon, color: cat.color }); }} />
                      <Popconfirm title="Delete this category?" onConfirm={() => handleDelete(cat.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </motion.div>
                )}
              </AnimatePresence>
          ))}
        </div>
      </motion.div>
    </Modal>
  );
}
