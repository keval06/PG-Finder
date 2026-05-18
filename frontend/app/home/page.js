// It's the data fetcher and assembler before anything reaches the browser.

import { pgApi } from "@/lib/api/pg";
import HomeClient from "../HomeClient";

// getPGs() — Fetch All PGs with Search Params
async function getPGs(searchParams) {
  try {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => params.append(k, v));
    }

    if (!params.has("page")) params.append("page", "1");
    if (!params.has("limit")) params.append("limit", "10"); 

    let result;
    if (searchParams?.lat && searchParams?.lng) {
      const radius = searchParams.radius || 5;
      params.delete("lat");
      params.delete("lng");
      params.delete("radius");
      result = await pgApi.getNearby(searchParams.lat, searchParams.lng, radius, params.toString());
    } 
    else {
      result = await pgApi.getAll(params.toString());
    }

    return Array.isArray(result)
      ? { data: result, totalPages: 1, page: 1, totalCount: result.length }
      : result;
  }
  catch (err) {
    console.error("[SSR] getPGs failed — backend may be unreachable:", err.message || err);
    return { data: [], totalPages: 1, page: 1, totalCount: 0 }; //?If the backend is off or broken, it catches the error and safely returns an empty array [] so the website doesn't crash.
  }
}

export default async function Home({ searchParams }) {
  const resolvedParams = await searchParams;

  const mapParams = new URLSearchParams();
  
  if (resolvedParams) {
    Object.entries(resolvedParams).forEach(([k, v]) => {
      if (k !== "page" && k !== "limit") mapParams.append(k, v); // skip pagination keys
    });
  }

  const [pgResponse, mapPgs] = await Promise.all([
    getPGs(resolvedParams),
    pgApi.getMapData(mapParams.toString()).catch(() => []),
  ]);

  const data = (pgResponse.data || []).map((pg) => {
    const images = Array.isArray(pg.images) ? pg.images : [];
    return {
      ...pg,
      images,
      image: images[0]?.url ?? null,
      ratingData: {
        avg: pg.avgRating ?? 0,
        count: pg.reviewCount ?? 0,
      },
    };
  });

  return (
    <div className="bg-white min-h-screen">
      <HomeClient
        data={data}
        mapPgs={mapPgs}
        pagination={{
          currentPage: Number(pgResponse.page) || 1,
          totalPages: Number(pgResponse.totalPages) || 1,
          totalCount: Number(pgResponse.totalCount) || 0,
        }}
      />
    </div>
  );
}
