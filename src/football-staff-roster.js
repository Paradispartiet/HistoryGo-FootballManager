// HG Football Manager — Role-based first-team staff roster v1
// Pure deterministic model. No DOM, storage or network access.

// Slottene under er aktiv rollekapasitet, ikke et universelt før-sesong-minimum.
// staffRoles.json bruker maxActive-semantikk; klubbens dokumenterte startersett
// avgjør hvor mange personer som faktisk må engasjeres før seriestart.
export const STAFF_ROLE_REQUIREMENTS = Object.freeze([
  Object.freeze({ id: "assistant_coach", label: "Assistenttrener", required: 1, acceptedTypes: Object.freeze(["assistant_coach"]) }),
  Object.freeze({ id: "training_coach", label: "Trener", required: 3, acceptedTypes: Object.freeze(["training_coach", "coach", "physical_coach"]) }),
  Object.freeze({ id: "physio", label: "Fysio", required: 1, acceptedTypes: Object.freeze(["physio"]) }),
  Object.freeze({ id: "goalkeeper_coach", label: "Keepertrener", required: 1, acceptedTypes: Object.freeze(["goalkeeper_coach", "former_goalkeeper_goalkeeper_coach"]) })
]);

export const REQUIRED_FIRST_TEAM_STAFF = STAFF_ROLE_REQUIREMENTS.reduce((sum, role) => sum + role.required, 0);
const asArray = (value) => Array.isArray(value) ? value : [];
const staffId = (member) => member?.id == null ? "" : String(member.id);

export function getStaffCandidateTypes(member) {
  const types = new Set();
  if (member?.staffType) types.add(String(member.staffType));
  asArray(member?.canBeHiredAs).forEach((type) => { if (type) types.add(String(type)); });
  return [...types];
}

export function canStaffFillRole(member, roleId) {
  const requirement = STAFF_ROLE_REQUIREMENTS.find((role) => role.id === roleId);
  if (!requirement || !staffId(member)) return false;
  const types = new Set(getStaffCandidateTypes(member));
  return requirement.acceptedTypes.some((type) => types.has(type));
}

function expandedSlots() {
  return STAFF_ROLE_REQUIREMENTS.flatMap((role) => Array.from({ length: role.required }, (_, index) => ({
    id: `${role.id}:${index + 1}`,
    roleId: role.id,
    label: role.label
  })));
}

function preferenceScore(member, roleId) {
  const type = String(member?.staffType || "");
  if (type === roleId) return 100;
  if (roleId === "training_coach" && type === "coach") return 90;
  if (roleId === "training_coach" && type === "physical_coach") return 80;
  if (asArray(member?.canBeHiredAs).includes(roleId)) return 75;
  if (roleId === "training_coach" && asArray(member?.canBeHiredAs).includes("coach")) return 65;
  return 50;
}

function assignmentKey(assignments) {
  return assignments.map((entry) => `${entry.slotId}=${entry.staffId || "~"}`).join("|");
}

export function assignFirstTeamStaff(staff = []) {
  const candidates = asArray(staff).filter((member) => staffId(member)).slice().sort((a, b) => staffId(a).localeCompare(staffId(b)));
  const slots = expandedSlots();
  let best = { filled: -1, preference: -1, key: "", assignments: [] };
  function visit(index, used, assignments, filled, preference) {
    if (index >= slots.length) {
      const key = assignmentKey(assignments);
      if (filled > best.filled || (filled === best.filled && preference > best.preference) || (filled === best.filled && preference === best.preference && (!best.key || key < best.key))) {
        best = { filled, preference, key, assignments: assignments.map((entry) => ({ ...entry })) };
      }
      return;
    }
    const slot = slots[index];
    const eligible = candidates.filter((member) => !used.has(staffId(member)) && canStaffFillRole(member, slot.roleId)).sort((a, b) => preferenceScore(b, slot.roleId) - preferenceScore(a, slot.roleId) || staffId(a).localeCompare(staffId(b)));
    for (const member of eligible) {
      const id = staffId(member);
      used.add(id);
      assignments.push({ slotId: slot.id, roleId: slot.roleId, label: slot.label, staffId: id, member });
      visit(index + 1, used, assignments, filled + 1, preference + preferenceScore(member, slot.roleId));
      assignments.pop();
      used.delete(id);
    }
    assignments.push({ slotId: slot.id, roleId: slot.roleId, label: slot.label, staffId: null, member: null });
    visit(index + 1, used, assignments, filled, preference);
    assignments.pop();
  }
  visit(0, new Set(), [], 0, 0);
  return best.assignments;
}

export function summarizeStaffRoster(staff = []) {
  const assignments = assignFirstTeamStaff(staff);
  const byRole = STAFF_ROLE_REQUIREMENTS.map((requirement) => {
    const assigned = assignments.filter((entry) => entry.roleId === requirement.id && entry.staffId);
    return {
      id: requirement.id,
      label: requirement.label,
      required: requirement.required,
      filled: assigned.length,
      complete: assigned.length >= requirement.required,
      staffIds: assigned.map((entry) => entry.staffId),
      names: assigned.map((entry) => entry.member?.name || entry.staffId)
    };
  });
  const filledCount = byRole.reduce((sum, role) => sum + role.filled, 0);
  const missing = byRole.filter((role) => !role.complete).map((role) => ({ ...role, missing: role.required - role.filled }));
  return {
    assignments,
    byRole,
    filledCount,
    requiredCount: REQUIRED_FIRST_TEAM_STAFF,
    complete: missing.length === 0,
    missing,
    missingLabel: missing.map((role) => `${role.label} ${role.filled}/${role.required}`).join(" · ")
  };
}

export function decorateHiredStaffWithAssignments(staff = []) {
  const roleById = new Map(assignFirstTeamStaff(staff).filter((entry) => entry.staffId).map((entry) => [entry.staffId, entry.roleId]));
  return asArray(staff).map((member) => {
    const assignedStaffRole = roleById.get(staffId(member)) || null;
    return assignedStaffRole ? { ...member, originalStaffType: member.staffType || null, assignedStaffRole, staffType: assignedStaffRole } : { ...member, assignedStaffRole: null };
  });
}

export function selectStarterStaffCandidates(staff = [], clubId = null) {
  const normalizedClubId = clubId == null ? "" : String(clubId);
  if (normalizedClubId) {
    const clubStarters = asArray(staff).filter((member) =>
      staffId(member) &&
      asArray(member?.starterClubIds).map(String).includes(normalizedClubId)
    );
    const clubAssignments = assignFirstTeamStaff(clubStarters).filter((entry) => entry.staffId);
    if (clubAssignments.length > 0) {
      const selectedIds = new Set(clubAssignments.map((entry) => entry.staffId));
      return clubStarters.filter((member) => selectedIds.has(staffId(member)));
    }
  }

  // Ukurerte klubber beholder det generiske 1+3+1+1-gulvet slik at en ny save
  // alltid er spillbar. Dette er fallback-kapasitet, ikke en påstand om klubbens
  // virkelige organisering.
  const starters = asArray(staff).filter((member) => member?.starterStaff === true && staffId(member));
  const selectedIds = new Set(assignFirstTeamStaff(starters).filter((entry) => entry.staffId).map((entry) => entry.staffId));
  return starters.filter((member) => selectedIds.has(staffId(member)));
}

export function summarizeStarterStaffReadiness(staff = [], clubId = null, hiredStaff = []) {
  const catalogue = asArray(staff);
  const candidates = selectStarterStaffCandidates(catalogue, clubId);
  const catalogueById = new Map(
    catalogue.filter((member) => staffId(member)).map((member) => [staffId(member), member])
  );
  const hiredMembers = asArray(hiredStaff)
    .map((entry) => typeof entry === "string" ? catalogueById.get(String(entry)) : entry)
    .filter((member) => staffId(member));

  const requiredAssignments = assignFirstTeamStaff(candidates).filter((entry) => entry.staffId);
  const hiredAssignments = assignFirstTeamStaff(hiredMembers).filter((entry) => entry.staffId);
  const roleRequirements = STAFF_ROLE_REQUIREMENTS.map((role) => {
    const required = requiredAssignments.filter((entry) => entry.roleId === role.id).length;
    const hired = hiredAssignments.filter((entry) => entry.roleId === role.id).length;
    const filled = Math.min(hired, required);
    const missing = Math.max(0, required - hired);
    return {
      id: role.id,
      label: role.label,
      required,
      hired,
      filled,
      missing,
      complete: missing === 0
    };
  }).filter((role) => role.required > 0);

  const requiredCount = roleRequirements.reduce((sum, role) => sum + role.required, 0);
  const hiredCount = roleRequirements.reduce((sum, role) => sum + role.filled, 0);
  const missing = roleRequirements.filter((role) => role.missing > 0);
  const normalizedClubId = clubId == null ? "" : String(clubId);
  const usesCuratedClubSet =
    Boolean(normalizedClubId) &&
    candidates.length > 0 &&
    candidates.every((member) =>
      member?.isPlaceholder !== true &&
      member?.needsResearch !== true &&
      asArray(member?.starterClubIds).map(String).includes(normalizedClubId)
    );

  return {
    candidates,
    candidateIds: candidates.map((member) => staffId(member)),
    roleRequirements,
    hiredCount,
    requiredCount,
    complete: requiredCount > 0 && missing.length === 0,
    missing,
    missingLabel: missing.map((role) => `${role.label} ${role.hired}/${role.required}`).join(" · "),
    usesCuratedClubSet
  };
}
