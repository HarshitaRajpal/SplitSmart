import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getCategories, createExpense, updateExpense } from '../api';

export default function AddExpenseModal({ open, onClose, onSuccess, editItem }) {
  const [form] = Form.useForm();
  const { user } = useUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) getCategories().then(setCategories).catch(console.error);
  }, [open]);

  useEffect(() => {
    if (open) {
      if (editItem) {
        const tags = editItem.tags ? (typeof editItem.tags === 'string' ? editItem.tags.split(',').map((t) => t.trim()).filter(Boolean) : editItem.tags) : [];
        form.setFieldsValue({
          title: editItem.title,
          amount: Number(editItem.amount),
          category_id: editItem.category_id,
          note: editItem.note,
          tags: tags.join(', '),
          expense_date: editItem.expense_date ? dayjs(editItem.expense_date) : dayjs(),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ expense_date: dayjs() });
      }
    }
  }, [open, editItem, form]);

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      const tagsStr = typeof v.tags === 'string'
        ? v.tags.split(',').map((t) => t.trim()).filter(Boolean).join(',')
        : (Array.isArray(v.tags) ? v.tags.join(',') : '');
      const payload = {
        user_id: user?.id,
        title: v.title,
        amount: v.amount,
        currency: 'INR',
        category_id: v.category_id || null,
        note: v.note || null,
        tags: tagsStr || null,
        expense_date: v.expense_date ? v.expense_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      };
      if (editItem) {
        await updateExpense(editItem.id, payload);
      } else {
        await createExpense(payload);
      }
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (e) {
      if (e.errorFields) return;
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: `${c.icon || '📌'} ${c.name}`,
  }));

  return (
    <Modal
      title={editItem ? 'Edit expense' : 'Add expense'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
      okText={editItem ? 'Save' : 'Add'}
      width={440}
      styles={{ body: { paddingTop: 16 } }}
      className="add-expense-modal"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Form form={form} layout="vertical" className="add-expense-form">
            <Form.Item name="title" label="What was it for?" rules={[{ required: true, message: 'Enter a title' }]}>
              <Input placeholder="e.g. Coffee, Groceries" size="large" />
            </Form.Item>
            <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true, message: 'Enter amount' }]}>
              <InputNumber
                min={0}
                step={10}
                placeholder="0"
                size="large"
                style={{ width: '100%' }}
                prefix="₹"
                formatter={(v) => (v ? `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                parser={(v) => (v ? v.replace(/₹\s?|,/g, '') : '')}
              />
            </Form.Item>
            <Form.Item name="category_id" label="Category">
              <Select
                placeholder="Choose category"
                size="large"
                allowClear
                options={categoryOptions}
                optionLabelProp="label"
                showSearch
                filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
            <Form.Item name="tags" label="Tags (optional)">
              <Input placeholder="e.g. work, reimbursable (comma separated)" size="large" />
            </Form.Item>
            <Form.Item name="expense_date" label="Date" rules={[{ required: true }]}>
              <DatePicker size="large" style={{ width: '100%' }} format="DD MMM YYYY" />
            </Form.Item>
            <Form.Item name="note" label="Note (optional)">
              <Input.TextArea rows={2} placeholder="Any details..." />
            </Form.Item>
          </Form>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}
