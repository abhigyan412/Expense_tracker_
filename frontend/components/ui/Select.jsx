import styles from "./Select.module.css";

export default function Select({ value, onChange, children, className = "", ...rest }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${styles.select} ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
