import { supabase } from './supabaseClient'

/** Має збігатися з bucket у Supabase Storage (див. `supabase/trip-covers-storage.sql`). */
export const TRIP_COVERS_BUCKET =
  (import.meta.env.VITE_SUPABASE_TRIP_COVERS_BUCKET as string | undefined) || 'trip-covers'

function coverObjectPath(userId: string, tripId: string, file: File): string {
  const m = /\.(jpe?g|png|webp|gif)$/i.exec(file.name)
  const ext = (m?.[1] || 'jpg').toLowerCase().replace('jpeg', 'jpg')
  return `${userId}/${tripId}/cover.${ext}`
}

export type UploadTripCoverResult =
  | { publicUrl: string }
  | { error: string }

/** Завантажує файл у bucket і повертає публічний URL для збереження в `trips.image_url`. */
export async function uploadTripCover(
  userId: string,
  tripId: string,
  file: File,
): Promise<UploadTripCoverResult> {
  const path = coverObjectPath(userId, tripId, file)
  const { error } = await supabase.storage.from(TRIP_COVERS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  })
  if (error) return { error: error.message }

  const { data } = supabase.storage.from(TRIP_COVERS_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) return { error: 'Не вдалося отримати публічне посилання на файл.' }
  return { publicUrl: data.publicUrl }
}
