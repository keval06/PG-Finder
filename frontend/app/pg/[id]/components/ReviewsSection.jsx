"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { reviewApi } from "../../../../lib/api/review";
import { useAuth } from "../../../context/AuthContext";
import ConfirmModal from "../../../../components/ConfirmModal";

import { useRouter } from "next/navigation";

const LIMIT = 5;

const SORT_OPTIONS = [
  { label: "Newest",  value: "newest"  },
  { label: "Oldest",  value: "oldest"  },
  { label: "Highest", value: "highest" },
  { label: "Lowest",  value: "lowest"  },
];

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3)         pages.push("...");
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

// ── STAR PICKER ───────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span className={s <= (hovered || value) ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
      {value > 0 && <span className="text-xs text-gray-400 ml-1">{value}/5</span>}
    </div>
  );
}

// ── REVIEW FORM — reused for submit + edit ────────────────────────────────────
function ReviewForm({ pgId, token, existingReview, onRequestConfirm, onCancel }) {
  const isEditing = !!existingReview;
  const [star,       setStar]       = useState(existingReview?.star    || 0);
  const [comment,    setComment]    = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const handleSubmit = () => {
    if (star === 0)                return setError("Please select a star rating");
    if (comment.trim().length < 3) return setError("Comment must be at least 3 characters");
    setError("");
    // Ask for confirmation before hitting the API
    onRequestConfirm({ star, comment });
  };

  return (
    <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/40 mb-4">
      <p className="text-sm font-medium text-gray-700 mb-3">
        {isEditing ? "Edit your review" : "Write a review"}
      </p>
      <div className="mb-3">
        <StarPicker value={star} onChange={setStar} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        maxLength={256}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      />
      <p className="text-[10px] text-gray-400 text-right mt-0.5">{comment.length}/256</p>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving..." : isEditing ? "Update Review" : "Submit Review"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ReviewsSection({ pgId, initialTotal, avgRating }) {
  const { user, ready } = useAuth(); // user = logged-in user obj, ready = localStorage loaded
  const router = useRouter();

  // ── Reviews list state ─────────────────────────────────
  const [reviews,     setReviews]     = useState([]);
  const [total,       setTotal]       = useState(initialTotal || 0);
  const [totalPages,  setTotalPages]  = useState(Math.ceil((initialTotal || 0) / LIMIT));
  const [currentPage, setCurrentPage] = useState(1);
  const [sort,        setSort]        = useState("newest");
  const [loading,     setLoading]     = useState(true);

  // ── Form state ─────────────────────────────────────────
  // canReview: null = still checking, true = show submit form, false = no form
  // myReview:  the user's existing review if already submitted
  // editMode:  whether edit form is open
  const [canReview, setCanReview] = useState(null);
  const [myReview,  setMyReview]  = useState(null);
  const [editMode,  setEditMode]  = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  // ── Confirm modal state ────────────────────────────────
  // modal: null = closed, { type, onConfirm, title, description, confirmText, variant }
  const [modal, setModal] = useState(null);

  // ── Fetch paginated reviews list ───────────────────────
  const fetchReviews = async () => {
    setLoading(true);
    const data = await reviewApi.getByPgIdPaginated(pgId, currentPage, LIMIT, sort);
    setReviews(data.reviews);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [pgId, currentPage, sort]);

  // ── Check if this user can review ─────────────────────
  // Waits for auth to be ready, only runs if user is logged in
  useEffect(() => {
    if (!ready || !user) return;

    const token = localStorage.getItem("token");

    const check = async () => {
      const result = await reviewApi.canReview(pgId, token);
      // 3 possible responses from backend:
      // { canReview: true }                                          → show submit form
      // { canReview: false, reason: "no_booking" }                   → show "book first" msg
      // { canReview: false, reason: "already_reviewed", review: {}}  → show edit/delete

      if (result.reason === "already_reviewed") {
        setMyReview(result.review); // store existing review for edit form
        setCanReview(false);
      } else {
        setCanReview(result.canReview);
      }
    };

    check();
  }, [pgId, user, ready]);

  // ── Handlers ───────────────────────────────────────────
  const handleSort = (newSort) => { setSort(newSort); setCurrentPage(1); };
  const goTo = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  // Called after successful submit or edit
  const handleReviewSuccess = (savedReview) => {
    setMyReview(savedReview);
    setCanReview(false); // switch to "your review" view
    setEditMode(false);
    fetchReviews();      // refresh list so new/updated review appears
    router.refresh();
    
  };

  // Opens confirm modal then performs delete
  const handleDelete = () => {
    setModal({
      title: "Delete Review?",
      description: "Your review will be permanently removed.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(true);
        setModal(null);
        const token = localStorage.getItem("token");
        await reviewApi.delete(myReview._id, token);
        setMyReview(null);
        setCanReview(true);
        setDeleting(false);
        fetchReviews();
        router.refresh();
      },
    });
  };

  // Opens confirm modal then performs submit (new review)
  const handleSubmitConfirm = (formData) => {
    setModal({
      title: "Submit Review?",
      description: `${formData.star} star${formData.star > 1 ? "s" : ""} — "${formData.comment.slice(0, 60)}${formData.comment.length > 60 ? "…" : ""}"`,
      confirmText: "Submit",
      variant: "primary",
      onConfirm: async () => {
        setModal(null);
        const token = localStorage.getItem("token");
        const result = await reviewApi.submit({ pg: pgId, star: formData.star, comment: formData.comment }, token);
        if (result?._id) handleReviewSuccess(result);
      },
    });
  };

  // Opens confirm modal then performs update (edit review)
  const handleEditConfirm = (formData) => {
    setModal({
      title: "Update Review?",
      description: `${formData.star} star${formData.star > 1 ? "s" : ""} — "${formData.comment.slice(0, 60)}${formData.comment.length > 60 ? "…" : ""}"`,
      confirmText: "Update",
      variant: "primary",
      onConfirm: async () => {
        setModal(null);
        const token = localStorage.getItem("token");
        const result = await reviewApi.update(myReview._id, { star: formData.star, comment: formData.comment }, token);
        if (result?._id) handleReviewSuccess(result);
      },
    });
  };

  const startIndex  = (currentPage - 1) * LIMIT;
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const token       = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold">
          Reviews
          <span className="text-gray-500 font-normal text-base ml-2">({total})</span>
          {avgRating && (
            <span className="text-yellow-500 text-base font-normal ml-2">★ {avgRating}/5</span>
          )}
        </h2>
        {total > 1 && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start sm:self-auto">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSort(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                  sort === opt.value ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── REVIEW FORM SECTION ── */}
      {ready && (
        <div className="mb-2">

          {/* Case 1: Not logged in */}
          {!user && (
            <p className="text-xs text-gray-400 mb-4">
              <a href="/auth/login" className="text-blue-500 hover:underline">Log in</a> to leave a review.
            </p>
          )}

          {/* Case 2: Logged in, still checking eligibility */}
          {user && canReview === null && (
            <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse mb-4" />
          )}

          {/* Case 3: Logged in, no booking */}
          {user && canReview === false && !myReview && (
            <p className="text-xs text-gray-400 mb-4">
              You need to book this PG before leaving a review.
            </p>
          )}

          {/* Case 4: Logged in, has booking, hasn't reviewed — show submit form */}
          {user && canReview === true && (
            <ReviewForm pgId={pgId} token={token} onRequestConfirm={handleSubmitConfirm} />
          )}

          {/* Case 5: Already reviewed — show their review card with edit/delete */}
          {user && myReview && !editMode && (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30 mb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-blue-600 mb-1">Your review</p>
                  <span className="text-yellow-400 text-sm">
                    {"★".repeat(myReview.star)}{"☆".repeat(5 - myReview.star)}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{myReview.comment}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setEditMode(true)}
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Case 6: Edit mode — show edit form with existing data pre-filled */}
          {user && myReview && editMode && (
            <ReviewForm
              pgId={pgId}
              token={token}
              existingReview={myReview}
              onRequestConfirm={handleEditConfirm}
              onCancel={() => setEditMode(false)}
            />
          )}
        </div>
      )}

      {/* ── LOADING SKELETON ── */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 animate-pulse">
              <div className="flex justify-between mb-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-200 rounded mt-2" />
              <div className="h-3 w-3/4 bg-gray-200 rounded mt-1.5" />
            </div>
          ))}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && total === 0 && (
        <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
      )}

      {/* ── REVIEWS LIST ── */}
      {!loading && total > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-sm capitalize">{r.user?.name || "Anonymous"}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-yellow-500 text-sm flex-shrink-0">
                    {"★".repeat(r.star)}{"☆".repeat(5 - r.star)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 hidden sm:block">
                Showing{" "}
                <span className="font-medium text-gray-600">
                  {startIndex + 1}–{Math.min(startIndex + LIMIT, total)}
                </span>{" "}
                of <span className="font-medium text-gray-600">{total}</span> reviews
              </p>
              <div className="flex items-center gap-1 mx-auto sm:mx-0">
                <button
                  onClick={() => goTo(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <div className="flex items-center gap-1">
                  {pageNumbers.map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs text-gray-400 select-none">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goTo(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          page === currentPage
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => goTo(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* ── CONFIRM MODAL ── */}
      {modal && (
        <ConfirmModal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          onConfirm={modal.onConfirm}
          title={modal.title}
          description={modal.description}
          confirmText={modal.confirmText}
          variant={modal.variant}
          processing={deleting}
        />
      )}
    </div>
  );
}