// Save-local staff access for a public club anchor. This deliberately does not
// mutate unlocks: it only ranks existing, place-linked profiles by distance.
function distanceKm(a, b) {
  const rad = (value) => (value * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function getPublicStartStaffCandidates(anchor, staff = [], places = [], minimum = 3) {
  if (!anchor?.placeId || !Number.isFinite(anchor.latitude) || !Number.isFinite(anchor.longitude)) return [];
  const placeById = new Map(places.filter((place) => place?.placeId).map((place) => [place.placeId, place]));
  return staff
    .filter((member) => member?.id && Array.isArray(member.sourcePlaceIds) && member.sourcePlaceIds.length)
    .map((member, order) => {
      const sources = member.sourcePlaceIds
        .map((placeId) => placeById.get(placeId))
        .filter((place) => Number.isFinite(place?.latitude) && Number.isFinite(place?.longitude));
      const direct = member.sourcePlaceIds.includes(anchor.placeId);
      const nearest = sources.reduce((best, place) => Math.min(best, distanceKm(anchor, place)), Infinity);
      return { member, order, direct, distance: direct ? 0 : nearest };
    })
    .filter((entry) => Number.isFinite(entry.distance))
    .sort((a, b) => Number(b.direct) - Number(a.direct) || a.distance - b.distance || a.order - b.order)
    .slice(0, Math.max(0, minimum))
    .map((entry) => entry.member);
}
