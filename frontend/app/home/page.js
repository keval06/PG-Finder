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

    let result;
    if (searchParams?.lat && searchParams?.lng) {
      const radius = searchParams.radius || 5;
      params.delete("lat");
      params.delete("lng");
      params.delete("radius");
      result = await pgApi.getNearby(searchParams.lat, searchParams.lng, radius, params.toString());
    } else {
      result = await pgApi.getAll(params.toString());
    }

    return Array.isArray(result)
      ? { data: result, totalPages: 1, page: 1, totalCount: result.length }
      : result;
  } catch {
    return { data: [], totalPages: 1, page: 1, totalCount: 0 }; //?If the backend is off or broken, it catches the error and safely returns an empty array [] so the website doesn't crash.
  }
}




// ?getAvgRating(pgId) — Calculate Average Rating
async function getAvgRating(pgId) {
  try {
    const result = await reviewApi.getByPgIdPaginated(pgId,1, 500);


    // reviewApi.getByPgId now returns paginated shape: { reviews, total, ... }
    // but also handle plain array for safety
    const reviews = result?.reviews ?? [];
    const total = result?.total ?? 0;

    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.star, 0) / reviews.length;
      return { avg: avg.toFixed(1), count: total };
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
      const [allImages, ratingData] = await Promise.all([
        imageApi.getByPgId(pg._id).catch(() => []),
        getAvgRating(pg._id),
      ]);

      const images = Array.isArray(allImages) ? allImages : [];
      return {
        ...pg,
        images,
        image: images[0]?.url ?? null,
        ratingData,
      };
    })
  );

  // Step C: Render and Pass Data Down
  // 3. Render HomeClient and pass the fully cooked `data` DOWN as a prop
  return (
    <div className="bg-gray-50 min-h-screen">
      <HomeClient
        data={data}
        pagination={{
          currentPage: Number(pgResponse.page) || 1,
          totalPages: Number(pgResponse.totalPages) || 1,
          totalCount: Number(pgResponse.totalCount) || 0,
        }}
      />
    </div>
  );
}
