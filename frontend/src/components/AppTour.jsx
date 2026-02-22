import { useState, useEffect } from 'react';
import { Tour } from 'antd';

const STORAGE_KEY = 'splitsmart-tour-done';

export default function AppTour({ open: controlledOpen, onClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(!!controlledOpen);
      return;
    }
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setOpen(true);
  }, [controlledOpen]);

  const steps = [
    {
      title: 'Welcome to SplitSmart',
      description: 'Track expenses, see monthly trends, and manage recurring bills in one place.',
    },
    {
      title: 'Add an expense',
      description: 'Click this button anytime to log a new expense. You can add category and date.',
      target: () => document.querySelector('[data-tour="add-expense"]'),
    },
    {
      title: 'Your expense list',
      description: 'All your logged expenses appear here. Edit or delete any entry.',
      target: () => document.querySelector('[data-tour="expense-list"]'),
    },
    {
      title: 'Charts & insights',
      description: 'Monthly spending bar chart and category-wise pie chart for the selected month.',
      target: () => document.querySelector('[data-tour="charts"]'),
    },
    {
      title: 'Recurring expenses',
      description: 'Add rent, subscriptions, or any repeating expense so you never forget.',
      target: () => document.querySelector('[data-tour="recurring"]'),
    },
    {
      title: "You're all set!",
      description: 'Switch themes from the header and start logging. Happy tracking!',
    },
  ];

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, '1');
    onClose?.();
  };

  return (
    <Tour
      open={open}
      onClose={handleClose}
      steps={steps.map((s) => (s.target ? { ...s } : { title: s.title, description: s.description }))}
    />
  );
}
