"use client";

import { ChevronRight } from "lucide-react";
import PGCardBase from "../../../components/PGCardBase";

export default function ListingCard({ pg }) {
  return (
    <PGCardBase
      pg={pg}
      href={`/my-listings/${pg._id}`}
      showInactive={true}
      footerAction={
        <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold sm:justify-center">
          Manage <ChevronRight size={13} />
        </div>
      }
    />
  );
}