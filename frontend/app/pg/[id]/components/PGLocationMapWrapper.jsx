"use client";

import dynamic from "next/dynamic";

const PGLocationMap = dynamic(() => import("./PGLocationMap"), { ssr: false });

export default function PGLocationMapWrapper(props) {
  return <PGLocationMap {...props} />;
}
