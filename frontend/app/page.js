"use client";

import useCategories from "@/hooks/useCategories";
import useExpenses from "@/hooks/useExpenses";
import useSummary from "@/hooks/useSummary";
import SummaryCards from "@/components/SummaryCards";
import CategorySection from "@/components/CategorySection";
import ExpenseSection from "@/components/ExpenseSection";
import ExpenseList from "@/components/ExpenseList";
import Card from "@/components/ui/Card";
import styles from "./page.module.css";

export default function Home() {
  const categories = useCategories();
  const expenses = useExpenses();
  const summary = useSummary();

  function refreshAll() {
    categories.refetch();
    expenses.refetch();
    summary.refetch();
  }

  async function handleCreateCategory(name) {
    await categories.create(name);
    refreshAll();
  }

  async function handleCreateExpense(expense) {
    await expenses.create(expense);
    refreshAll();
  }

  return (
    <>
      <header className={styles.header}>
        <span className={styles.headerTitle}>Expense Tracker</span>
      </header>

      <main className={styles.main}>
        <SummaryCards summary={summary.data} loading={summary.loading} />

        <div className={styles.grid}>
          <CategorySection
            categories={categories.data}
            loading={categories.loading}
            onCreate={handleCreateCategory}
          />
          <ExpenseSection categories={categories.data} onCreate={handleCreateExpense} />
        </div>

        <Card>
          <h2 className={styles.panelTitle}>Recent Expenses</h2>
          <ExpenseList expenses={expenses.data} loading={expenses.loading} />
        </Card>
      </main>
    </>
  );
}
