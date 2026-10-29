import type { CrewMember } from "@/data/schema";

function parsePositiveInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const number = Number(trimmed);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function resequenceCrew(crew: readonly CrewMember[]): CrewMember[] {
  return crew.map((member, index) => {
    const badgeNumber = String(index + 1).padStart(2, "0");
    return member.badgeNumber === badgeNumber
      ? member
      : { ...member, badgeNumber };
  });
}

/** Keeps crew order and visible badge numbers aligned as 01, 02, 03, ... */
export function normalizeCrewOrder(crew: readonly CrewMember[]): CrewMember[] {
  const ordered = crew
    .map((member, index) => ({
      member,
      index,
      order: parsePositiveInteger(member.badgeNumber) ?? index + 1,
    }))
    .sort((left, right) => left.order - right.order || left.index - right.index)
    .map(({ member }) => member);

  return resequenceCrew(ordered);
}

/** Moves a member to the requested one-based position and closes any gaps. */
export function moveCrewMemberToBadgeNumber(
  crew: readonly CrewMember[],
  memberId: string,
  requestedBadgeNumber: string
): CrewMember[] {
  const ordered = normalizeCrewOrder(crew);
  const fromIndex = ordered.findIndex((member) => member.id === memberId);
  const requestedPosition = parsePositiveInteger(requestedBadgeNumber);
  if (fromIndex < 0 || requestedPosition === null || ordered.length === 0) {
    return ordered;
  }

  const toIndex = Math.min(requestedPosition - 1, ordered.length - 1);
  const next = [...ordered];
  const [member] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, member);
  return resequenceCrew(next);
}
