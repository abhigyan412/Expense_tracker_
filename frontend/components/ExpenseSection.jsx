"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import styles from "./ExpenseSection.module.css";

export default function ExpenseSection({ categories, onCreate }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const hasCategories = categories.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const parsedAmount = Number(amount);

    if (!trimmedTitle) {
      setValidationError("Title is required");
      return;
    }
    if (!amount || !(parsedAmount > 0)) {
      setValidationError("Amount must be greater than 0");
      return;
    }
    if (!categoryId) {
      setValidationError("Please select a category");
      return;
    }

    setValidationError(null);
    setSubmitError(null);
    setSubmitting(true);
    try {
      await onCreate({
        title: trimmedTitle,
        amount: parsedAmount,
        category_id: Number(categoryId),
      });
      setTitle("");
      setAmount("");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h2 className={styles.title}>ADD EXPENSE</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="expense-title">
            Title
          </label>
          <Input
            id="expense-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lunch"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="expense-amount">
            Amount
          </label>
          <Input
            id="expense-amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="expense-category">
            Category
          </label>
          <Select
            id="expense-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!hasCategories}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={submitting || !hasCategories}>
          {submitting ? "Adding…" : "Add"}
        </Button>
      </form>
      {!hasCategories && (
        <p className={styles.hint}>Add a category first</p>
      )}
      {validationError && <p className={styles.error}>{validationError}</p>}
      {submitError && <p className={styles.error}>{submitError}</p>}
    </Card>
  );
}
