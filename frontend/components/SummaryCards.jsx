import Card from "@/components/ui/Card";
import styles from "./SummaryCards.module.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function SummaryCards({ summary, loading }) {
  if (loading) {
    return <p>Loading summary…</p>;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className={styles.grid}>
      <Card className={styles.tile}>
        <p className={styles.label}>Total</p>
        <p className={styles.value}>{currency.format(Number(summary.total))}</p>
      </Card>
      <Card className={styles.tile}>
        <p className={styles.label}>Count</p>
        <p className={styles.value}>{summary.count}</p>
      </Card>
      <Card className={styles.tile}>
        <p className={styles.label}>Average</p>
        <p className={styles.value}>{currency.format(Number(summary.average))}</p>
      </Card>
    </div>
  );
}
