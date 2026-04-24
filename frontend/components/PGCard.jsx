"use client";

import PGCardBase from "./PGCardBase";
import BookNowButton from "../app/pg/[id]/components/BookNowButton";

export default function PGCard({ pg }) {
  return (
    <PGCardBase
      pg={pg}
      href={`/pg/${pg._id}`}
      footerAction={<BookNowButton pgId={pg._id} />}
    />
  );
}
