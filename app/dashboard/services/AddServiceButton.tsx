"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AddServiceModal from "./AddServiceModal";

interface AddServiceButtonProps {
  onRefresh?: () => void;
}

export default function AddServiceButton({ onRefresh }: AddServiceButtonProps) {
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const handleServiceAdded = () => {
    // Trigger data refresh to show the new service
    if (onRefresh) {
      onRefresh();
    }
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
