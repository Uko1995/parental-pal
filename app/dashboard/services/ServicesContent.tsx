"use client";

import { useState, useMemo } from "react";
import { ClientServiceInterface } from "./action";
import ServiceCard from "./ServiceCard";
import ServiceFilters, {
  ServiceFilters as FilterState,
} from "./ServiceFilters";
import ServiceDetailsModal from "./ServiceDetailsModal";
import AddServiceModal from "./AddServiceModal";
import toast from "react-hot-toast";

interface ServicesContentProps {
  services: ClientServiceInterface[];
  serviceStats: {
    totalServices: number;
    activeServices: number;
    categories: Record<string, number>;
  };
}

export default function ServicesContent({
  services: initialServices,
  serviceStats,
}: ServicesContentProps) {
  const [services, setServices] = useState(initialServices);
  const [selectedService, setSelectedService] =
    useState<ClientServiceInterface | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] =
    useState<ClientServiceInterface | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    status: "",
    priceRange: { min: 0, max: 100000 },
    sortBy: "name",
    sortOrder: "asc",
    viewMode: "grid",
  });

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    const filtered = services.filter((service) => {
      const matchesSearch = filters.search
        ? service.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;

      const matchesCategory = filters.category
        ? service.type === filters.category
        : true;

      const matchesStatus = filters.status
        ? service.status === filters.status
        : true;

      const matchesPriceRange =
        Number(service.pricing.baseRate) >= filters.priceRange.min &&
        Number(service.pricing.baseRate) <= filters.priceRange.max;

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesPriceRange
      );
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (filters.sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "date":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case "pricing.baseRate":
          aValue = a.pricing.baseRate;
          bValue = b.pricing.baseRate;
          break;
        case "metrics.totalBookings":
          aValue = a.metrics?.totalBookings || 0;
          bValue = b.metrics?.totalBookings || 0;
          break;
        case "metrics.averageRating":
          aValue = a.metrics?.averageRating || 0;
          bValue = b.metrics?.averageRating || 0;
          break;
        case "metrics.totalRevenue":
          aValue = a.metrics?.totalRevenue || 0;
          bValue = b.metrics?.totalRevenue || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [services, filters]);

  // Handle service actions
  const handleViewDetails = (service: ClientServiceInterface) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleEditService = (service: ClientServiceInterface) => {
    // TODO: Implement edit functionality
    toast.success("Edit functionality coming soon!");
    console.log("Edit service:", service);
  };

  const handleDeleteService = (service: ClientServiceInterface) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      // TODO: Implement actual delete API call
      const response = await fetch(`/api/services/${serviceToDelete._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove service from local state
        setServices((prev) =>
          prev.filter((s) => s._id !== serviceToDelete._id)
        );
        toast.success("Service deleted successfully");
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Error deleting service");
    } finally {
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  const cancelDeleteService = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleAddService = () => {
    setShowAddServiceModal(true);
  };

  const handleServiceAdded = () => {
    // Trigger page refresh to show the new service
    window.location.reload();
  };

  return (
    <>
      {/* Filters */}
      <ServiceFilters
        onFilterChange={setFilters}
        categoryCounts={serviceStats.categories}
        totalServices={filteredAndSortedServices.length}
      />

      {/* Services Display */}
      {filteredAndSortedServices.length === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.category || filters.status
              ? "Try adjusting your filters to see more services."
              : "Get started by creating your first service."}
          </p>
          <button className="btn btn-primary" onClick={handleAddService}>
            <span className="text-lg mr-2">+</span>
            Create New Service
          </button>
        </div>
      ) : (
        <div
          className={
            filters.viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "space-y-4"
          }
        >
          {filteredAndSortedServices.map((service) => (
            <ServiceCard
              key={service._id?.toString()}
              service={service}
              onViewDetails={handleViewDetails}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          ))}
        </div>
      )}

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={selectedService}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedService(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && serviceToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete the service &ldquo;
              <span className="font-semibold">{serviceToDelete.name}</span>
              &rdquo;?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All associated data will be
              permanently removed.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={cancelDeleteService}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDeleteService}>
                Delete Service
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={cancelDeleteService}></div>
        </div>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        onServiceAdded={handleServiceAdded}
      />
    </>
  );
}
