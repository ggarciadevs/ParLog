const BASE_URL = 'https://api.golfcourseapi.com/v1';

export async function searchCourses(query: string) {
  const url = `${BASE_URL}/search?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Key ${process.env.GOLF_API_KEY}` },
  });
  if (!res.ok) throw new Error('Golf API request failed');
  const data = await res.json() as { courses: unknown[] };
  return data.courses;
}
