"use client";

import {
  EllipsisVerticalIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface Child {
  childId?: string;
  name: string;
  age: number;
  class?: string;
  schoolName?: string;
  subjects?: string[];
  parentName: string;
  parentEmail: string;
  services: Array<{
    serviceType: string;
    status: string;
    bookingId: string;
    createdAt: Date;
  }>;
}

interface ChildActionsProps {
  child: Child;
}

export default function ChildActions({ child }: ChildActionsProps) {
  const handleViewDetails = () => {
    const modal = document.getElementById(
      `child_modal_${child.childId}`
    ) as HTMLDialogElement;
    modal?.showModal();
  };

  return (
    <>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">
          <EllipsisVerticalIcon className="w-4 h-4" />
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border"
        >
          <li>
            <button className="text-sm">
              <PencilIcon className="w-4 h-4" />
              Edit Profile
            </button>
          </li>
          <li>
            <button className="text-sm" onClick={handleViewDetails}>
              <EyeIcon className="w-4 h-4" />
              View Details
            </button>
          </li>
        </ul>
      </div>

      {/* Child Details Modal */}
      <dialog id={`child_modal_${child.childId}`} className="modal">
        <div
          className="modal-box overflow-y-auto"
          style={{
            width: "75vw",
            maxWidth: "80vw",
            height: "70vh",
            maxHeight: "75vh",
          }}
        >
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="font-bold text-lg mb-4">
            {child.name} - Complete Profile
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="card bg-base-50">
              <div className="card-body p-4">
                <h4 className="font-semibold text-primary mb-3">
                  Basic Information
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Full Name:
                    </span>
                    <p className="text-gray-900 font-semibold">{child.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Age:</span>
                    <p className="text-gray-900 font-semibold">
                      {child.age} years old
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Class:</span>
                    <p className="text-gray-900 font-semibold">
                      {child.class || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">School:</span>
                    <p className="text-gray-900 font-semibold">
                      {child.schoolName || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="card bg-base-50">
              <div className="card-body p-4">
                <h4 className="font-semibold text-secondary mb-3">
                  Parent Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Parent Name:
                    </span>
                    <p className="text-gray-900 font-semibold">
                      {child.parentName}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900 font-semibold">
                      {child.parentEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            {child.subjects && child.subjects.length > 0 && (
              <div className="card bg-base-50">
                <div className="card-body p-4">
                  <h4 className="font-semibold text-accent mb-3">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {child.subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="badge badge-outline font-semibold"
                      >
                        {subject}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Services */}
            <div className="card bg-base-50">
              <div className="card-body p-4">
                <h4 className="font-semibold text-info mb-3">
                  Enrolled Services
                </h4>
                {child.services && child.services.length > 0 ? (
                  <div className="space-y-3">
                    {child.services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">
                            {service.serviceType}
                          </div>
                          <div className="text-sm text-gray-500">
                            Booking ID: {service.bookingId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`badge ${
                              service.status === "active"
                                ? "badge-success"
                                : service.status === "pending"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {service.status}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(service.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No services enrolled yet
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
