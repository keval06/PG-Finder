import HomeClient from "../HomeClient";
// This is a Server Component (no "use client" at top)

async function getPGs() {
  try {
    const res = await fetch("http://localhost:5000/api/pg", {
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return []; //If the backend is off or broken, it catches the error and safely returns an empty array [] so the website doesn't crash.
  }
}

async function getFirstImage(pgId) {
  try {  
    // 1. Fetch raw PG list from Node.js Backend
  
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



export default async function Home() {  
  // Step A: Get the raw list of PGs
  const pgs = await getPGs();
  // Step B: Loop over every PG and enrich it

  // 2. Loop through all PGs to grab extra data (like images and ratings)
  //By using Promise.all, we tell the Next.js Server: "Shoot all 20 API calls into the internet at the EXACT same millisecond. I will wait here until all 20 of them come back successfully."

  const data = await Promise.all(
    pgs.map(async (pg) => {      // Step B-1: Fire BOTH APIs at the exact same moment
    
      const [image, ratingData] = await Promise.all([
        getFirstImage(pg._id),
        getAvgRating(pg._id),
      ]);      // Step B-2: Glue the new data onto the old PG object
      
      // Combine it all into one rich PG object
      return { ...pg, image, ratingData };
    })
  );  
  // Step C: Render and Pass Data Down
// 3. Render HomeClient and pass the fully cooked `data` DOWN as a prop
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <HomeClient data={data} />
      </div>
    </div>
  );
}
