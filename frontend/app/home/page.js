// ?a React Server Component.
// ?It's the data fetcher and assembler before anything reaches the browser.
// Server does the heavy lifting (API calls, data assembly)
// Client just displays and handles user interaction
import { pgApi } from "../../lib/api/pg";
import { imageApi } from "../../lib/api/image";
import { reviewApi } from "../../lib/api/review";

import HomeClient from "../HomeClient";

// ?getPGs() — Fetch All PGs with Search Params
async function getPGs(searchParams) {
  try {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => params.append(k, v));
    }

    // Ensure pagination is always enabled for scalable fetching
    if (!params.has("page")) params.append("page", "1");
    if (!params.has("limit")) params.append("limit", "10"); // 10 PGs per page

    const result = await pgApi.getAll(params.toString());
    return Array.isArray(result)
      ? { data: result, totalPages: 1, page: 1, totalCount: result.length }
      : result;
  } catch {
    return { data: [], totalPages: 1, page: 1, totalCount: 0 }; //?If the backend is off or broken, it catches the error and safely returns an empty array [] so the website doesn't crash.
  }
}

//? getFirstImage(pgId) — Fetch One Image Per PG
async function getFirstImage(pgId) {
  try {
    // 1. Fetch raw PG list from Node.js Backend
    const imgs = await imageApi.getByPgId(pgId);
    return imgs?.[0]?.url ?? null; //*     ?? null → nullish coalescing → if undefined/null → return null
  } catch {
    return null;
  }
}

// ?getAvgRating(pgId) — Calculate Average Rating
async function getAvgRating(pgId) {
  try {
    const reviews = await reviewApi.getByPgId(pgId);

    if (reviews && reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.star, 0) / reviews.length;
      return { avg: avg.toFixed(1), count: reviews.length };
    }
    return null;
  } catch {
    return null;
  }
}

// ?Server Async Function
// ?`async` function as a React component — only possible in Server Components.

export default async function Home({ searchParams }) {
  const resolvedParams = await searchParams;

  // Step A: Get the raw list of PGs
  const pgResponse = await getPGs(resolvedParams);

  // Step B: Loop over every PG and enrich it

  // ?2. Loop through all PGs to grab extra data (like images and ratings)
  //?By using Promise.all, we tell the Next.js Server: "Shoot all 20 API calls into the internet at the EXACT same millisecond. I will wait here until all 20 of them come back successfully."

  //! Outer Promise.all — all PGs in parallel:
  // ?→ returns array of Promises (one per PG)
  // ?→ [Promise<pg1enriched>, Promise<pg2enriched>, Promise<pg3enriched>]

  //? Promise.all([...])
  // → fires ALL simultaneously
  // → waits for ALL to resolve
  // → returns array of results

  const data = await Promise.all(
    (pgResponse.data || []).map(async (pg) => {
      // Step B-1: Fire BOTH APIs at the exact same moment

      const [image, ratingData] = await Promise.all([
        getFirstImage(pg._id),
        getAvgRating(pg._id),
      ]); // Step B-2: Glue the new data onto the old PG object

      // Combine it all into one rich PG object
      return { ...pg, image, ratingData };
    })
  );

  // Step C: Render and Pass Data Down
  // 3. Render HomeClient and pass the fully cooked `data` DOWN as a prop
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <HomeClient
          data={data}
          pagination={{
            currentPage: Number(pgResponse.page) || 1,
            totalPages: Number(pgResponse.totalPages) || 1,
            totalCount: Number(pgResponse.totalCount) || 0,
          }}
        />
      </div>
    </div>
  );
}
