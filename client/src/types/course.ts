export type ApiHole = { par: number; yardage: number; handicap: number }

export type ApiTee = {
  tee_name: string
  course_rating: number
  slope_rating: number
  total_yards: number
  par_total: number
  holes: ApiHole[]
}

export type ApiCourse = {
  id: number
  club_name: string
  course_name: string
  location: { city: string; state: string; country: string }
  tees: { male: ApiTee[]; female: ApiTee[] }
}

export type ScorecardHole = {
  hole_number: number
  par: number
  yards: number
  handicap: number
}

export type ScorecardState = {
  courseName: string
  tee: string
  courseRating: number
  slopeRating: number
  parTotal: number
  holes: ScorecardHole[]
}
