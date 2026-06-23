"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  FolderIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

interface HtrDriveFolderSectionProps {
  bookingId: string;
  initialDriveFolderUrl?: string | null;
  initialDriveFolderName?: string | null;
  onSuccess?: (folder: {
    folderUrl: string;
    folderName?: string;
  }) => void;
}

export default function HtrDriveFolderSection({
  bookingId,
  initialDriveFolderUrl,
  initialDriveFolderName,
  onSuccess,
}: HtrDriveFolderSectionProps) {
  const [driveFolderUrl, setDriveFolderUrl] = useState(
    initialDriveFolderUrl ?? "",
  );
  const [driveFolderName, setDriveFolderName] = useState(
    initialDriveFolderName ?? "",
  );
  const [creating, setCreating] = useState(false);

  const handleCreateFolder = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/drive-folder`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create Drive folder");
        return;
      }

      setDriveFolderUrl(data.folderUrl);
      setDriveFolderName(data.folderName ?? "");
      toast.success(
        data.alreadyExists
          ? "Drive folder already exists"
          : "Drive folder created successfully",
      );
      onSuccess?.({
        folderUrl: data.folderUrl,
        folderName: data.folderName,
      });
    } catch {
      toast.error("Failed to create Drive folder");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!driveFolderUrl) return;
    try {
      await navigator.clipboard.writeText(driveFolderUrl);
      toast.success("Drive link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (driveFolderUrl) {
    return (
      <div className="bg-base-100 p-4 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <FolderIcon className="w-5 h-5 text-primary" />
          <h6 className="font-semibold text-base">Google Drive Folder</h6>
        </div>
        {driveFolderName ? (
          <p className="text-sm text-gray-600 mb-2">{driveFolderName}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <a
            href={driveFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary gap-2"
          >
            Open in Drive
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-sm btn-outline gap-2"
          >
            Copy link
            <ClipboardDocumentIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warning/10 p-4 rounded-lg border border-warning/30">
      <div className="flex items-center gap-2 mb-2">
        <FolderIcon className="w-5 h-5 text-warning" />
        <h6 className="font-semibold text-base">Google Drive Folder</h6>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Drive folder not created. Parents use this folder for handbooks and camp
        photos.
      </p>
      <button
        type="button"
        className="btn btn-sm btn-warning"
        onClick={handleCreateFolder}
        disabled={creating}
      >
        {creating ? (
          <>
            <span className="loading loading-spinner loading-xs" />
            Creating folder...
          </>
        ) : (
          "Create Folder"
        )}
      </button>
    </div>
  );
}
