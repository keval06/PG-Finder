"use client";

import { useState } from "react";
import { Pencil, EyeOff, Eye, Check, ChevronDown } from "lucide-react";
import PGForm from "./PGForm";
import ConfirmModal from "../components/ConfirmModal";
import { Bed } from "lucide-react";

const genderLabel = { male: "Male", female: "Female", mix: "Co-ed" };

export default function ListingCard({ pg, onUpdated }) {
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editError, setEditError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [noChangesMsg, setNoChangesMsg] = useState("");

  // existing room types fetched when edit opens
  const [fetchedRoomTypes, setFetchedRoomTypes] = useState(null);

  const inactive = pg.isActive === false;
  const avg = pg.ratingData?.avg ? `★ ${pg.ratingData.avg}/5` : "★ No reviews";
  const count = pg.ratingData?.count || 0;
  const token = () => localStorage.getItem("token");

  // fetch room types when edit opens
  const openEdit = async () => {
    if (editOpen) {
      setEditOpen(false);
      setFetchedRoomTypes(null);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/roomtype?pgId=${pg._id}`,
      );
      const data = await res.json();
      setFetchedRoomTypes(Array.isArray(data) ? data : []);
    } catch {
      setFetchedRoomTypes([]);
    }
    setEditOpen(true);
  };

  const handleEdit = ({ pgData, roomTypes, removedIds }) => {
    // 1. check for changes in PG data
    const pgFields = ["name", "price", "address", "city", "gender", "room", "bathroom", "toilet", "food"];
    const pgChanged = pgFields.some(f => pgData[f] !== pg[f]) || 
                      JSON.stringify([...(pgData.amenities||[])].sort()) !== JSON.stringify([...(pg.amenities||[])].sort());

    // 2. check for changes in Room Types
    const rtChanged = removedIds.length > 0 || 
                      roomTypes.length !== (fetchedRoomTypes?.length || 0) ||
                      roomTypes.some((rt, i) => {
                        const old = fetchedRoomTypes[i];
                        if (!old) return true; // new RT
                        return rt.name !== old.name || 
                               rt.sharingCount !== old.sharingCount || 
                               rt.availableRooms !== old.availableRooms || 
                               rt.price !== old.price;
                      });

    if (!pgChanged && !rtChanged) {
      setNoChangesMsg("No changes detected.");
      setTimeout(() => setNoChangesMsg(""), 3000);
      return;
    }

    setPendingData({ pgData, roomTypes, removedIds });
    setConfirmOpen(true);
  };

  const confirmEdit = async () => {
    if (!pendingData) return;
    const { pgData, roomTypes, removedIds } = pendingData;
    
    setSaving(true);
    setEditError("");
    try {
      const tok = token();

      // 1 — update PG
      const pgRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pg/${pg._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tok}`,
          },
          body: JSON.stringify(pgData),
        },
      );
      if (!pgRes.ok) {
        const d = await pgRes.json();
        setEditError(d.message || "Failed to update PG");
        return;
      }
      const updatedPg = await pgRes.json();

      // 2 — soft-delete removed room types
      for (const id of removedIds) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roomtype/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tok}` },
        });
      }

      // 3 — update existing / create new room types sequentially
      for (const rt of roomTypes) {
        if (rt._id) {
          // existing — PATCH
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/roomtype/${rt._id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tok}`,
              },
              body: JSON.stringify({
                name: rt.name,
                sharingCount: rt.sharingCount,
                availableRooms: rt.availableRooms,
                price: rt.price,
              }),
            },
          );
        } else {
          // new — POST
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roomtype`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tok}`,
            },
            body: JSON.stringify({ ...rt, pg: pg._id }),
          });
        }
      }

      onUpdated(updatedPg);
      setEditOpen(false);
      setFetchedRoomTypes(null);
      setConfirmOpen(false);
      setPendingData(null);
      setSuccessMsg("Saved!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    setStatusConfirmOpen(false);
    setToggling(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pg/${pg._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ isActive: !pg.isActive }),
        },
      );
      if (res.ok) {
        setSuccessMsg(pg.isActive ? "Deactivated!" : "Activated!");
        setTimeout(() => setSuccessMsg(""), 3000);
        onUpdated(await res.json());
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      onClick={openEdit}
      className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer ${
        inactive
          ? "border-slate-200 opacity-60"
          : editOpen 
            ? "border-blue-400 shadow-lg shadow-blue-50/50" 
            : "border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50/50"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-4 sm:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-slate-900 truncate flex items-center gap-2">
              {pg.name}
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${editOpen ? "rotate-180 text-blue-500" : ""}`} />
            </h2>
            {inactive && (
              <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-yellow-500 mb-1">
            {avg}
            {count > 0 && (
              <span className="text-slate-400 font-normal text-xs ml-1">
                ({count} reviews)
              </span>
            )}
          </p>
          <p className="text-xs text-slate-400 mb-3 truncate">
            {pg.address}, {pg.city}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">
              {genderLabel[pg.gender]}
            </span>
            <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 capitalize">
              {pg.food}
            </span>
            {(pg.amenities || []).slice(0, 4).map((a) => (
              <span
                key={a}
                className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600"
              >
                {a}
              </span>
            ))}
            {(pg.amenities || []).length > 4 && (
              <span className="text-xs text-slate-400">
                +{pg.amenities.length - 4} more
              </span>
            )}
          </div>
          {successMsg && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <Check size={12} />
              {successMsg}
            </p>
          )}
          {editError && (
            <p className="text-xs text-red-500 mt-2">{editError}</p>
          )}
          {noChangesMsg && (
            <p className="text-xs text-blue-500 mt-2 flex items-center gap-1"><Check size={12}/>{noChangesMsg}</p>
          )}
        </div>

        <div className="flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-center gap-2 px-4 sm:px-5 pb-4 sm:py-5 sm:border-l border-slate-100 sm:w-40 flex-shrink-0">
          <div className="sm:text-center">
            <p className="text-xl font-bold text-slate-900 leading-none">
              ₹{pg.price?.toLocaleString("en-IN")}
            </p>
            <p className="text-[12px] text-slate-400 mt-0.5">/month</p>
          </div>
          <div className="flex sm:flex-col gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); openEdit(); }}
              className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                editOpen
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <Pencil size={12} /> {editOpen ? "Close" : "Edit"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setStatusConfirmOpen(true); }}
              disabled={toggling}
              className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                inactive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              }`}
            >
              {inactive ? (
                <>
                  <Eye size={12} /> Activate
                </>
              ) : (
                <>
                  <EyeOff size={12} /> Deactivate
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {editOpen && fetchedRoomTypes !== null && (
        <div className="px-4 sm:px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
          <PGForm
            initial={{ ...pg, roomTypes: fetchedRoomTypes }}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditOpen(false);
              setFetchedRoomTypes(null);
            }}
            saving={saving}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmEdit}
        title="Confirm Updates"
        description="Are you sure you want to save these changes to your PG and room types?"
        confirmText="Confirm"
        variant="primary"
        processing={saving}
      >
        <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3 max-h-60 mt-2">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">PG Details</p>
            <div className="flex flex-col gap-1.5 text-left">
              <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>Name: <span className="font-semibold text-slate-900">{pendingData?.pgData?.name || pg.name}</span></span>
              </p>
              <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>City: <span className="font-semibold text-slate-900">{pendingData?.pgData?.city || pg.city}</span></span>
              </p>
            </div>
          </div>

          {(pendingData?.roomTypes?.length > 0) && (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bed size={12} /> Room Types
              </p>
              <div className="flex flex-col gap-2">
                {pendingData.roomTypes.map((rt, i) => (
                  <div key={i} className="bg-white/80 rounded-lg p-2.5 border border-blue-100 flex justify-between items-center text-xs">
                    <div className="text-left">
                      <p className="font-bold text-slate-900 capitalize">{rt.name}</p>
                      <p className="text-slate-500">{rt.availableRooms} rooms</p>
                    </div>
                    <p className="font-bold text-blue-600">₹{rt.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ConfirmModal>

      <ConfirmModal 
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        onConfirm={toggleActive}
        title={pg.isActive ? "Deactivate PG?" : "Activate PG?"}
        description={pg.isActive ? "This listing will no longer be visible to guests. You can reactivate it anytime." : "This listing will become visible to all guests."}
        confirmText={pg.isActive ? "Yes, Deactivate" : "Yes, Activate"}
        variant={pg.isActive ? "danger" : "primary"}
        processing={toggling}
      />
    </div>
  );
}
