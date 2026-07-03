export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const APP_NAME = "Zep";

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  PACKED: { label: "Packed", color: "bg-purple-100 text-purple-800" },
  ASSIGNED: { label: "Assigned", color: "bg-indigo-100 text-indigo-800" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-orange-100 text-orange-800" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  RETURNED: { label: "Returned", color: "bg-gray-100 text-gray-800" },
  REFUNDED: { label: "Refunded", color: "bg-teal-100 text-teal-800" },
};

export const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  SUCCESS: { label: "Paid", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Refunded", color: "bg-teal-100 text-teal-800" },
};
