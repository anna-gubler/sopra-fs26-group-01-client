import React from "react";
import toast from "react-hot-toast";
import styles from "@/styles/skillmaps.module.css";

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
      className: styles["toast-container"],
    }
  );
}
