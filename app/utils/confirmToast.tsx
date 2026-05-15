import React from "react";
import toast from "react-hot-toast";
import styles from "@/styles/skillmaps.module.css";

// custom styling confirm dialog with react-hot-toast
// styling is here because so that it doesn't get overriden by standard toast style
const darkToastStyle: React.CSSProperties = {
  background: "var(--bg-elevated)",
  color: "var(--text-bright)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 0 0 3px rgba(233, 30, 140, 0.18), 0 8px 32px rgba(0, 0, 0, 0.6)",
};

export function confirmToast(message: string, onConfirm: () => Promise<void> | void): void {
  toast(
    (t) => {
      const handleConfirm = async () => {
        toast.dismiss(t.id);
        await onConfirm();
      };
      return (
        <div className={styles["toast-body"]}>
          <span>{message}</span>
          <div className={styles["toast-actions"]}>
            <button className="btn-gradient btn-no-lift" onClick={handleConfirm}>
              Confirm
            </button>
            <button className="btn-ghost" onClick={() => toast.dismiss(t.id)}>
              Cancel
            </button>
          </div>
        </div>
      );
    },
    {
      duration: Infinity,
      style: darkToastStyle,
    }
  );
}
