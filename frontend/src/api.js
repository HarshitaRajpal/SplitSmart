const API = '/api';

export async function ensureUser(name = 'Me', email = 'default@splitsmart.local') {
  const res = await fetch(`${API}/users/ensure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API}/categories`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCategory(data) {
  const res = await fetch(`${API}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCategory(id, data) {
  const res = await fetch(`${API}/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function getExpenses(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/expenses?${q}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getExpenseSummary(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/expenses/summary?${q}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getExpensesByCategory(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/expenses/by-category?${q}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createExpense(data) {
  const res = await fetch(`${API}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateExpense(id, data) {
  const res = await fetch(`${API}/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${API}/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function getRecurring(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/recurring?${q}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createRecurring(data) {
  const res = await fetch(`${API}/recurring`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateRecurring(id, data) {
  const res = await fetch(`${API}/recurring/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteRecurring(id) {
  const res = await fetch(`${API}/recurring/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}
