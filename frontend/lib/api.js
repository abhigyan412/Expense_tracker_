const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function extractMessage(data) {
  if (!data) return "Request failed";
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  return "Request failed";
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new ApiError(extractMessage(data), res.status, data);
  }

  return data;
}

export function getCategories() {
  return request("/categories/");
}

export function createCategory(name) {
  return request("/categories/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getExpenses() {
  return request("/expenses/");
}

export function createExpense({ title, amount, category_id }) {
  return request("/expenses/", {
    method: "POST",
    body: JSON.stringify({ title, amount, category_id }),
  });
}

export function getSummary() {
  return request("/summary/");
}
