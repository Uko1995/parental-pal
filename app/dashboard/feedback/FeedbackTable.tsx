"use client";

import type { FeedbackItem } from "./types";

interface FeedbackTableProps {
  items: FeedbackItem[];
  onView: (item: FeedbackItem) => void;
}

export default function FeedbackTable({ items, onView }: FeedbackTableProps) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-base-200 bg-white p-6 text-center text-gray-500">
        No feedback submissions yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-base-200 bg-white">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Services Interested</th>
            <th>Interest Level</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td className="font-medium">{item.name || "Anonymous"}</td>
              <td>{item.email || "Not provided"}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {item.servicesInterested.slice(0, 2).map((service) => (
                    <span key={service} className="badge badge-ghost badge-sm">
                      {service}
                    </span>
                  ))}
                  {item.servicesInterested.length > 2 && (
                    <span className="badge badge-sm">
                      +{item.servicesInterested.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="capitalize">
                {item.interestLevel.replaceAll("-", " ")}
              </td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-sm btn-outline" onClick={() => onView(item)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
