import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import styles from "./ExpenseList.module.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function ExpenseList({ expenses, loading }) {
  if (loading) {
    return <p>Loading expenses…</p>;
  }

  if (expenses.length === 0) {
    return <p className={styles.empty}>No expenses yet — add your first one</p>;
  }

  return (
    <>
      <div className={styles.cards}>
        {expenses.map((expense) => (
          <Card key={expense.id} className={styles.card}>
            <div className={styles.cardRow}>
              <span className={styles.title}>{expense.title}</span>
              <span className={styles.amount}>
                {currency.format(Number(expense.amount))}
              </span>
            </div>
            <div className={styles.cardRow}>
              <Badge>{expense.category.name}</Badge>
              <span className={styles.date}>
                {dateFormatter.format(new Date(expense.created_at))}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.title}</td>
              <td className={styles.amount}>
                {currency.format(Number(expense.amount))}
              </td>
              <td>
                <Badge>{expense.category.name}</Badge>
              </td>
              <td>{dateFormatter.format(new Date(expense.created_at))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
