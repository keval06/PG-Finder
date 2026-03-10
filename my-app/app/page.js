// !React Server Component
// This is the "brain" of the Home Page. Instead of sending raw HTML to the user immediately, this page talks to our backend database to get real PG listings before showing anything.
import HomeClient from "./HomeClient";

async function getFirstImage(pgId) {
  try {
    const res = await fetch(`http://localhost:5000/api/image?pgId=${pgId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const imgs = await res.json();
      return imgs?.[0]?.url ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

async function getAvgRating(pgId) {
  try {
    const res = await fetch(`http://localhost:5000/api/review?pg=${pgId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const reviews = await res.json();
      if (reviews.length > 0) {
        const avg =
          reviews.reduce((sum, r) => sum + r.star, 0) / reviews.length;
        return { avg: avg.toFixed(1), count: reviews.length };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function getPGs() {
  try {
    const res = await fetch("http://localhost:5000/api/pg", {
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const pgs = await getPGs();

  const data = await Promise.all(
    pgs.map(async (pg) => {
      const [image, ratingData] = await Promise.all([
        getFirstImage(pg._id),
        getAvgRating(pg._id),
      ]);
      return { ...pg, image, ratingData };
    }),
  );
  console.log("FETCHED PGS", data);

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <HomeClient data={data} />
      </div>
    </div>
  );
}
