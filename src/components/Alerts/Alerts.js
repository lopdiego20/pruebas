import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

export default function Alerts() {
  const notify = () => toast("Wow so easy!");

  useEffect(() => {
    notify();
  }, []);
  return (
    <div>
      <ToastContainer />
    </div>
  );
}
