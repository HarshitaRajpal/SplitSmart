import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getCategories, createRecurring } from '../api';

const FREQ_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function AddRecurringModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const { user } = useUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ next_due: dayjs(), frequency: 'monthly' });
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      await createRecurring({
        user_id: user?.id,
        title: v.title,
        amount: v.amount,
        currency: 'INR',
        category_id: v.category_id || null,
        note: v.note || null,
        frequency: v.frequency,
        next_due: v.next_due.format('YYYY-MM-DD'),
      });
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

  return (
    <Modal
      title="Add recurring expense"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
      okText="Add"
      width={420}
    >
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Rent, Netflix" size="large" />
          </Form.Item>
          <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true }]}>
            <InputNumber min={0} step={10} placeholder="0" size="large" style={{ width: '100%' }} prefix="₹" />
          </Form.Item>
          <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
            <Select size="large" options={FREQ_OPTIONS} />
          </Form.Item>
          <Form.Item name="next_due" label="Next due date" rules={[{ required: true }]}>
            <DatePicker size="large" style={{ width: '100%' }} format="DD MMM YYYY" />
          </Form.Item>
          <Form.Item name="category_id" label="Category">
            <Select
              placeholder="Category"
              size="large"
              allowClear
              options={categories.map((c) => ({ value: c.id, label: `${c.icon || '📌'} ${c.name}` }))}
              optionLabelProp="label"
              showSearch
              filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="note" label="Note (optional)">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </motion.div>
    </Modal>
  );
}
