"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AddServiceModal from "./AddServiceModal";

export default function AddServiceButton() {
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const handleServiceAdded = () => {
    // Trigger page refresh to show the new service
    window.location.reload();
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setShowAddServiceModal(true)}
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Add New Service
      </button>

      <AddServiceModal
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        onServiceAdded={handleServiceAdded}
      />
    </>
  );
}
