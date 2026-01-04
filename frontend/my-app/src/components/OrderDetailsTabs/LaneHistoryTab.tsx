interface LaneHistoryTabProps {
  orderId: string;
}

export default function LaneHistoryTab({ orderId }: LaneHistoryTabProps) {
  // Lane history would come from a separate endpoint if available
  // For now, showing placeholder as backend doesn't provide this data
  return (
    <div className="text-gray-500">
      <p>Lane history data not available in current backend API.</p>
      <p className="text-sm mt-2">Order ID: {orderId}</p>
    </div>
  );
}

