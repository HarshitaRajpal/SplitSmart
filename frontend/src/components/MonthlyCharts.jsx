import { Card, Select, Typography, Row, Col } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyCharts({ summary = [], byCategory = [], year, month, onYearChange, onMonthChange }) {
  const barData = summary.map((s) => ({
    name: MONTHS[Number(s.month) - 1],
    total: Number(s.total),
    month: s.month,
  }));

  const pieData = byCategory
    .filter((c) => c.name)
    .map((c) => ({ name: c.name, value: Number(c.total), color: c.color || '#6366f1' }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="charts-section"
      data-tour="charts"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Monthly spending"
            extra={
              <Select
                value={year}
                onChange={onYearChange}
                options={[0, 1, 2].map((i) => ({
                  value: new Date().getFullYear() - i,
                  label: `${new Date().getFullYear() - i}`,
                }))}
                style={{ width: 100 }}
              />
            }
            className="chart-card"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`} />
                <Tooltip
                  formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Total']}
                  contentStyle={{ borderRadius: 12 }}
                />
                <Bar dataKey="total" fill="var(--chart-bar, #6366f1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="This month by category"
            extra={
              <Select
                value={month}
                onChange={onMonthChange}
                options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
                style={{ width: 90 }}
              />
            }
            className="chart-card"
          >
            {pieData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">No data for this month</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
}
