"use client";

import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ParentInvoiceBuilder from "@/components/parent-invoices/ParentInvoiceBuilder";
import ParentSearchCombobox, {
  type ParentSearchOption,
} from "@/components/admin/ParentSearchCombobox";
import AdminBookingForm from "./AdminBookingForm";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";
import {
  toastErrorOnce,
  toastSuccessOnce,
} from "@/lib/toast-once";

type ModalMode = "booking" | "past-invoice";

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (options?: { keepOpen?: boolean }) => void;
}

const AddBookingModal = forwardRef<
  { resetForm: () => void },
  AddBookingModalProps
>(({ isOpen, onClose, onSuccess }, ref) => {
  const [modalMode, setModalMode] = useState<ModalMode>("booking");
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [createdParentEmail, setCreatedParentEmail] = useState("");
  const [showInvoiceOption, setShowInvoiceOption] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  const [invoiceParentEmail, setInvoiceParentEmail] = useState("");
  const [selectedParent, setSelectedParent] = useState<ParentSearchOption | null>(
    null,
  );
  const [resolvedParentName, setResolvedParentName] = useState<string | null>(
    null,
  );
  const [draftInvoiceId, setDraftInvoiceId] = useState<string | null>(null);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  const [bookingFormKey, setBookingFormKey] = useState(0);
  const sendingInvoiceRef = useRef(false);
  const savingInvoiceRef = useRef(false);

  const resetForm = () => {
    setModalMode("booking");
    setCreatedBookingId(null);
    setCreatedParentEmail("");
    setShowInvoiceOption(false);
    setInvoiceParentEmail("");
    setSelectedParent(null);
    setResolvedParentName(null);
    setDraftInvoiceId(null);
    setBookingFormKey((k) => k + 1);
  };

  useImperativeHandle(ref, () => ({
    resetForm,
  }));

  const handleParentSelect = (parent: ParentSearchOption | null) => {
    setSelectedParent(parent);
    setInvoiceParentEmail(parent?.email ?? "");
    setResolvedParentName(parent?.name ?? null);
    setDraftInvoiceId(null);
    setBookingFormKey((k) => k + 1);
  };

  const handleBookingCreated = ({
    bookingId,
    parentEmail,
  }: {
    bookingId: string;
    parentEmail: string;
  }) => {
    setCreatedBookingId(bookingId);
    setCreatedParentEmail(parentEmail);
    setShowInvoiceOption(true);
    onSuccess({ keepOpen: true });
  };

  const handleGenerateInvoice = async () => {
    if (!createdBookingId) {
      toastErrorOnce("No booking ID available", "admin-booking-invoice-id");
      return;
    }
    if (sendingInvoiceRef.current) return;

    sendingInvoiceRef.current = true;
    setIsSendingInvoice(true);

    try {
      const response = await fetch(
        `/api/bookings/${createdBookingId}/invoice`,
        { method: "POST" },
      );

      if (response.ok) {
        const result = await response.json();
        const docType =
          result.documentType === "receipt" ? "Receipt" : "Invoice";
        toastSuccessOnce(
          `${docType} ${result.documentNumber} sent to ${result.sentTo}!`,
          "admin-booking-invoice-sent",
        );
        setShowInvoiceOption(false);
        resetForm();
        onClose();
        onSuccess();
      } else {
        const error = await response.json();
        toastErrorOnce(
          error.error || "Failed to generate document",
          "admin-booking-invoice-error",
        );
      }
    } catch {
      toastErrorOnce(
        "Error generating document",
        "admin-booking-invoice-error",
      );
    } finally {
      sendingInvoiceRef.current = false;
      setIsSendingInvoice(false);
    }
  };

  const handleSkipInvoice = () => {
    setShowInvoiceOption(false);
    resetForm();
    onClose();
    onSuccess();
  };

  const savePastSessionInvoice = async (
    lineItems: ParentInvoiceLineItem[],
    options?: { closeOnSuccess?: boolean },
  ): Promise<string | null> => {
    if (savingInvoiceRef.current) return null;

    const closeOnSuccess = options?.closeOnSuccess ?? true;
    const email = invoiceParentEmail.trim();
    if (!email) {
      toastErrorOnce(
        "Select a parent account first",
        "admin-past-invoice-email",
      );
      return null;
    }

    savingInvoiceRef.current = true;
    setIsSavingInvoice(true);
    try {
      const url = draftInvoiceId
        ? `/api/admin/parent-invoices/${draftInvoiceId}`
        : "/api/admin/parent-invoices";
      const res = await fetch(url, {
        method: draftInvoiceId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentEmail: email, lineItems }),
      });
      const data = await res.json();

      if (!res.ok) {
        toastErrorOnce(
          data.error || data.errors?.join(", ") || "Failed to save invoice",
          "admin-past-invoice-save-error",
        );
        return null;
      }

      const invoiceId = data.invoice?._id as string | undefined;
      if (invoiceId) {
        setDraftInvoiceId(invoiceId);
      }
      if (data.parentName) {
        setResolvedParentName(data.parentName);
      }

      if (closeOnSuccess) {
        toastSuccessOnce(
          "Invoice saved as draft",
          "admin-past-invoice-saved",
        );
        resetForm();
        onClose();
        onSuccess();
      }

      return invoiceId ?? draftInvoiceId;
    } finally {
      savingInvoiceRef.current = false;
      setIsSavingInvoice(false);
    }
  };

  const submitPastSessionInvoice = async (
    lineItems: ParentInvoiceLineItem[],
  ) => {
    if (savingInvoiceRef.current) return;

    const email = invoiceParentEmail.trim();
    if (!email) {
      toastErrorOnce(
        "Select a parent account first",
        "admin-past-invoice-email",
      );
      return;
    }

    let invoiceId = draftInvoiceId;
    if (!invoiceId) {
      invoiceId = await savePastSessionInvoice(lineItems, {
        closeOnSuccess: false,
      });
      if (!invoiceId) return;
    } else {
      savingInvoiceRef.current = true;
      setIsSavingInvoice(true);
      try {
        const patchRes = await fetch(`/api/admin/parent-invoices/${invoiceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentEmail: email, lineItems }),
        });
        const patchData = await patchRes.json();
        if (!patchRes.ok) {
          toastErrorOnce(
            patchData.error ||
              patchData.errors?.join(", ") ||
              "Failed to update invoice",
            "admin-past-invoice-save-error",
          );
          return;
        }
        if (patchData.parentName) {
          setResolvedParentName(patchData.parentName);
        }
      } finally {
        savingInvoiceRef.current = false;
        setIsSavingInvoice(false);
      }
    }

    savingInvoiceRef.current = true;
    setIsSavingInvoice(true);
    try {
      const res = await fetch(`/api/admin/parent-invoices/${invoiceId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentEmail: email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toastErrorOnce(
          data.error || data.errors?.join(", ") || "Failed to submit invoice",
          "admin-past-invoice-submit-error",
        );
        return;
      }

      const invoiceNumber = data.invoice?.invoiceNumber || "invoice";
      toastSuccessOnce(
        `Invoice ${invoiceNumber} submitted — parent can pay from their profile`,
        "admin-past-invoice-submitted",
      );
      resetForm();
      onClose();
      onSuccess();
    } finally {
      savingInvoiceRef.current = false;
      setIsSavingInvoice(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div>
            <h3 className="font-bold text-lg">Add New Booking</h3>
            <p className="text-sm text-base-content/60 mt-1">
              Create a booking or bill past sessions for a parent.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost shrink-0"
            onClick={onClose}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-4 mb-6">
          <ParentSearchCombobox
            value={selectedParent}
            onSelect={handleParentSelect}
            disabled={isSavingInvoice || isSendingInvoice}
          />
        </div>

        <div role="tablist" className="tabs tabs-boxed mb-6 w-full sm:w-fit">
          <button
            type="button"
            role="tab"
            className={`tab flex-1 sm:flex-none ${modalMode === "booking" ? "tab-active" : ""}`}
            onClick={() => setModalMode("booking")}
          >
            New Booking
          </button>
          <button
            type="button"
            role="tab"
            className={`tab flex-1 sm:flex-none ${modalMode === "past-invoice" ? "tab-active" : ""}`}
            onClick={() => setModalMode("past-invoice")}
          >
            Past Session Invoice
          </button>
        </div>

        {modalMode === "booking" ? (
          <>
            {!showInvoiceOption && (
              <AdminBookingForm
                key={bookingFormKey}
                parentPrefill={selectedParent}
                onClose={onClose}
                onSuccess={({ bookingId, parentEmail }) =>
                  handleBookingCreated({ bookingId, parentEmail })
                }
              />
            )}

            {showInvoiceOption && (
              <div className="p-4 bg-[#90AC19]/10 border-2 border-[#90AC19] rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">
                  Generate Invoice
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  Would you like to generate and send an invoice to{" "}
                  {createdParentEmail || "the parent"}?
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateInvoice}
                    disabled={isSendingInvoice}
                    className={`btn btn-sm btn-primary ${
                      isSendingInvoice ? "loading" : ""
                    }`}
                  >
                    {isSendingInvoice
                      ? "Sending..."
                      : "Generate & Send Invoice"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipInvoice}
                    disabled={isSendingInvoice}
                    className="btn btn-sm btn-ghost"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-5">
            {selectedParent && (
              <div className="rounded-xl border border-base-300 bg-base-100 p-4">
                <div className="form-control max-w-md">
                  <label className="label py-1">
                    <span className="label-text font-medium">Parent</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200"
                    value={resolvedParentName || selectedParent.name}
                    readOnly
                  />
                </div>
              </div>
            )}

            {!selectedParent ? (
              <p className="text-sm text-warning px-1">
                Select a parent account above before adding past session lines.
              </p>
            ) : (
              <ParentInvoiceBuilder
                pastOnly
                saving={isSavingInvoice}
                onSave={async (lineItems) => {
                  await savePastSessionInvoice(lineItems);
                }}
                onSubmitInvoice={async (lineItems) => {
                  await submitPastSessionInvoice(lineItems);
                }}
              />
            )}

            <div className="modal-action mt-2 pt-2 border-t border-base-300">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={isSavingInvoice}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
});

AddBookingModal.displayName = "AddBookingModal";

export default AddBookingModal;
