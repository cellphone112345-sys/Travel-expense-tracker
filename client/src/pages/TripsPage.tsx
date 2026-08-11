import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTrip, useDeleteTrip, useTrips, useUpdateTrip } from "../hooks/useTrips";
import { useCurrentTrip } from "../hooks/useCurrentTrip";
import { TripForm } from "../components/trips/TripForm";
import { Modal } from "../components/common/Modal";
import type { Trip } from "../types";
import { formatMoney } from "../utils/money";

export function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const { setCurrentTripId } = useCurrentTrip();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);

  function openTrip(trip: Trip) {
    setCurrentTripId(trip.id);
    navigate("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">我的旅程</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          + 新增旅程
        </button>
      </div>

      {isLoading && <p className="text-gray-500">載入中…</p>}
      {!isLoading && trips?.length === 0 && (
        <p className="text-gray-400">還沒有任何旅程，點右上角「+ 新增旅程」開始記帳吧！</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {trips?.map((trip) => (
          <div key={trip.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <button className="block w-full text-left" onClick={() => openTrip(trip)}>
              <div className="font-semibold text-gray-900">{trip.name}</div>
              <div className="mt-1 text-xs text-gray-500">
                {trip.startDate.slice(0, 10)} ~ {trip.endDate.slice(0, 10)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                當地幣別 {trip.baseCurrency} · 報表幣別 {trip.homeCurrency}
              </div>
              {trip.totalBudget !== null && (
                <div className="mt-2 text-sm text-brand">
                  預算 {formatMoney(trip.totalBudget, trip.homeCurrency)}
                </div>
              )}
            </button>
            <div className="mt-3 flex gap-3 text-xs">
              <button
                onClick={() => {
                  setEditing(trip);
                  setShowForm(true);
                }}
                className="text-gray-500 hover:underline"
              >
                編輯
              </button>
              <button
                onClick={() => {
                  if (confirm(`確定要刪除「${trip.name}」嗎？此動作無法復原。`)) {
                    deleteTrip.mutate(trip.id);
                  }
                }}
                className="text-red-500 hover:underline"
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? "編輯旅程" : "新增旅程"} onClose={() => setShowForm(false)}>
          <TripForm
            initial={editing ?? undefined}
            onCancel={() => setShowForm(false)}
            onSubmit={async (data) => {
              if (editing) {
                await updateTrip.mutateAsync({ id: editing.id, data });
              } else {
                const trip = await createTrip.mutateAsync(data);
                setCurrentTripId(trip.id);
              }
              setShowForm(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
