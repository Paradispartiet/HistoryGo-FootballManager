import { createClubCommunicationTimeline } from "../src/football-club-communication.js";

const checks = [];
const check = (label, ok) => checks.push([label, Boolean(ok)]);

const context = {
  week: 8,
  clubWeekState: { week: 8, phase: "review", mediaPressure: 72 },
  opponent: { id: "viking", name: "Viking" },
  lastMatch: { opponent: { name: "Brann" }, outcome: "win", score: { for: 2, against: 1 } },
  training: { label: "Kampforberedende · Restforsvar", programLabel: "Kampforberedende", focusLabel: "Restforsvar" },
  analysisPlan: {
    hypothesis: "Viking spiller gjennom første pressledd.",
    countermeasureLabel: "Sikre før balltapet",
    risk: "For mange bak ballen kan svekke angrepet.",
    watch: "Se de tre sikringsspillerne idet angrepet pågår."
  },
  playerConditions: [{ playerId: "ada", name: "Ada Hegerberg", load: 64, consecutiveFullMatches: 4, injury: null }],
  staff: [
    { id: "assistant", name: "Ingvild Stensland", staffType: "assistant_coach", roleLabel: "Assistenttrener" },
    { id: "physio", name: "Eli Landsem", staffType: "physio", roleLabel: "Fysio" }
  ],
  inboxSignals: [{
    id: "legacy-signal",
    senderName: "Lagkapteinen",
    subject: "Én tydelig beskjed",
    preview: "Garderoben trenger en prioritet.",
    body: ["Gi oss én oppgave."],
    dayIndex: 2
  }]
};

const before = JSON.stringify(context);
const first = createClubCommunicationTimeline(context);
const second = createClubCommunicationTimeline(context);
const curated = first.messages.filter((message) => message.id.startsWith("club-mail:"));
const legacy = first.messages.find((message) => message.id === "legacy-signal");
const medical = first.messages.find((message) => message.id.endsWith(":medical"));
const opponent = first.messages.find((message) => message.id.endsWith(":opponent-plan"));

check("v3-versjon brukes", first.version.endsWith(".v3"));
check("samme input gir samme mailer", JSON.stringify(first) === JSON.stringify(second));
check("input muteres ikke", JSON.stringify(context) === before);
check("alle kuraterte mailer har situasjon", curated.every((message) => message.guidance?.situation));
check("alle kuraterte mailer forklarer betydning", curated.every((message) => message.guidance?.meaning));
check("alle kuraterte mailer har managerspørsmål", curated.every((message) => message.guidance?.question));
check("alle kuraterte mailer har observasjonspunkt", curated.every((message) => message.guidance?.watch));
check("kuraterte mailer har minst to arbeidslenker", curated.every((message) => message.links.length >= 2));
check("arbeidslenkene har faktiske mål", curated.every((message) => message.links.every((link) => link.target && link.label)));
check("arbeidslenkene er deduplisert", curated.every((message) => new Set(message.links.map((link) => `${link.target}:${link.focusId}`)).size === message.links.length));
check("medisinsk mail peker presist til synlig individuell oppfølging", medical.links.some((link) => link.focusId === "trainingDayChangeIndividual"));
check("motstanderbrief peker presist til kampforberedelse", opponent.links.some((link) => link.focusId === "squadTacticsCommandPanel"));
check("eldre signal får samme veiledningsstruktur", Object.values(legacy.guidance).every(Boolean));
check("veiledning eller lenker flytter ingen fase", context.clubWeekState.phase === "review");

checks.forEach(([label, ok]) => console.log(`${ok ? "✓" : "✗"} ${label}`));
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Klubbkommunikasjon v3 feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Klubbkommunikasjon v3: ${checks.length}/${checks.length}`);
