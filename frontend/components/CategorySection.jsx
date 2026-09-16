"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import styles from "./CategorySection.module.css";

export default function CategorySection({ categories, loading, onCreate }) {
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError("Category name is required");
      return;
    }
    setValidationError(null);
    setSubmitError(null);
    setSubmitting(true);
    try {
      await onCreate(trimmed);
      setName("");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h2 className={styles.title}>Categories</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="category-name">
            Category name
          </label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Food"
          />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add"}
        </Button>
      </form>
      {validationError && <p className={styles.error}>{validationError}</p>}
      {submitError && <p className={styles.error}>{submitError}</p>}

      {loading ? (
        <p>Loading categories…</p>
      ) : categories.length === 0 ? (
        <p className={styles.empty}>No categories yet</p>
      ) : (
        <ul className={styles.list}>
          {categories.map((category) => (
            <li key={category.id} className={styles.listItem}>
              {category.name} <Badge>{category.expense_count}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
