import { useState, useEffect, useCallback } from 'react';
import { Spin, Tabs, Card, Select, Button, Space } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import Layout from './components/Layout';
import ExpenseList from './components/ExpenseList';
import MonthlyCharts from './components/MonthlyCharts';
import RecurringSection from './components/RecurringSection';
import AddExpenseModal from './components/AddExpenseModal';
import ManageCategoriesModal from './components/ManageCategoriesModal';
import { useUser } from './context/UserContext';
import {
  getExpenses,
  getExpenseSummary,
  getExpensesByCategory,
  deleteExpense,
} from './api';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

export default function App() {
  const { user, loading: userLoading } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [editItem, setEditItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [recurringKey, setRecurringKey] = useState(0);

  const loadExpenses = useCallback(() => {
    setLoading(true);
    const params = { userId: user?.id, limit: 200 };
    Promise.all([
      getExpenses(params),
      getExpenseSummary({ userId: user?.id, year }),
      getExpensesByCategory({ userId: user?.id, month, year }),
    ])
      .then(([exp, sum, cat]) => {
        setExpenses(exp);
        setSummary(sum);
        setByCategory(cat);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id, year, month]);

  useEffect(() => {
    if (!userLoading) loadExpenses();
  }, [userLoading, loadExpenses]);

  const handleEdit = (item) => {
    setEditItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Layout onExpenseAdded={loadExpenses} onRecurringAdded={() => setRecurringKey((k) => k + 1)}>
      {({ addBtnRef, addRecurringRef, openAddModal }) => (
        <>
          {userLoading ? (
            <div className="app-loading">
              <Spin size="large" />
            </div>
          ) : (
            <motion.div
              className="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs
                defaultActiveKey="1"
                size="large"
                className="main-tabs"
                items={[
                  {
                    key: '1',
                    label: 'Expenses',
                    children: (
                      <div className="expenses-tab">
                        <Card
                          title="Recent expenses"
                          extra={
                            <Space wrap>
                              <Button icon={<TagsOutlined />} onClick={() => setCategoriesModalOpen(true)}>
                                Categories
                              </Button>
                              <Select
                                value={year}
                                onChange={setYear}
                                options={[0, 1, 2].map((i) => ({
                                  value: currentYear - i,
                                  label: `${currentYear - i}`,
                                }))}
                                style={{ width: 100 }}
                              />
                            </Space>
                          }
                          className="expenses-card"
                        >
                          <ExpenseList
                            expenses={expenses}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAddClickRef={openAddModal ? { current: openAddModal } : undefined}
                          />
                        </Card>
                      </div>
                    ),
                  },
                  {
                    key: '2',
                    label: 'Insights',
                    children: (
                      <div className="insights-tab">
                        <MonthlyCharts
                          summary={summary}
                          byCategory={byCategory}
                          year={year}
                          month={month}
                          onYearChange={setYear}
                          onMonthChange={setMonth}
                        />
                      </div>
                    ),
                  },
                  {
                    key: '3',
                    label: 'Recurring',
                    children: (
                      <div className="recurring-tab">
                        <RecurringSection key={recurringKey} onAddRecurringRef={addRecurringRef} />
                      </div>
                    ),
                  },
                ]}
              />
            </motion.div>
          )}

          <AddExpenseModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setEditItem(null);
            }}
            onSuccess={loadExpenses}
            editItem={editItem}
          />
          <ManageCategoriesModal
            open={categoriesModalOpen}
            onClose={() => setCategoriesModalOpen(false)}
          />
        </>
      )}
    </Layout>
  );
}
