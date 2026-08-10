import {
  CLUB_COMMUNICATION_VERSION,
  createClubCommunicationTimeline,
  getClubCommunicationMessage
} from "../src/football-club-communication.js";

const checks = [];
const check = (label, ok, detail = "") => checks.push({ label, ok: Boolean(ok), detail });

const context = {
  week: 8,
  clubWeekState: { week: 8, phase: "review", mediaPressure: 72 },
  opponent: { id: "viking", name: "Viking" },
  lastMatch: { opponent: { name: "Brann" }, outcome: "win", score: { for: 2, against: 1 } },
  training: { label: "Kampforberedende · Restforsvar", programLabel: "Kampforberedende", focusLabel: "Restforsvar" },
  analysisPlan: {
    hypothesis: "Viking lokker presset høyt og spiller gjennom første ledd.",
    countermeasureLabel: "Sikre bakrommet før press",
    risk: "Vi gir dem mer tid foran blokka.",
    watch: "Avstanden mellom stopperne og sekseren etter balltap."
  },
  playerConditions: [
    { playerId: "p1", name: "Ada Hegerberg", load: 63, consecutiveFullMatches: 4, injury: null },
    { playerId: "p2", name: "Solveig Gulbrandsen", load: 22, consecutiveFullMatches: 1, injury: null }
  ],
  staff: [
    { id: "s1", name: "Ingvild Stensland", staffType: "assistant_coach", roleLabel: "Assistenttrener" },
    { id: "s2", name: "Eli Landsem", staffType: "physio", roleLabel: "Fysio" }
  ],
  inboxSignals: [{
    id: "captain-week-eight",
    threadId: "captain-thread",
    dayIndex: 2,
    senderName: "Lagkapteinen",
    senderRole: "Garderobe",
    subject: "Spillerne vil ha én tydelig beskjed",
    preview: "Garderoben trenger en prioritet.",
    body: ["Gi oss én oppgave vi kan kjenne igjen i økta."],
    priority: "high",
    choices: [{
      id: "one-task",
      label: "Gi én oppgave",
      selected: true,
      reply: { title: "Oppgaven er mottatt", body: "Kapteinen tar budskapet inn i garderoben." }
    }],
    source: { kind: "event", threadId: "captain-thread" }
  }],
  readMessageIds: ["club-mail:w8:match-review"]
};

const before = JSON.stringify(context);
const timeline = createClubCommunicationTimeline(context);
const again = createClubCommunicationTimeline(context);
const find = (suffix) => timeline.messages.find((message) => message.id.endsWith(suffix));
const review = find("match-review");
const medical = find("medical");
const training = find("training-follow-up");
const opponent = find("opponent-plan");
const press = find("press-brief");
const post = find("post-match");
const signal = getClubCommunicationMessage(timeline, "captain-week-eight");

check("riktig versjon", timeline.version === CLUB_COMMUNICATION_VERSION, timeline.version);
check("deterministisk tidslinje", JSON.stringify(timeline) === JSON.stringify(again));
check("input muteres ikke", JSON.stringify(context) === before);
check("mandagsmail bruker faktisk resultat og motstander", review.subject.includes("Brann") && review.facts.some((fact) => fact.value === "2–1"));
check("lesestatus bruker eksisterende melding-ID", review.isRead === true);
check("medisinsk mail navngir belastet spiller", medical.subject.includes("Ada Hegerberg") && medical.body.join(" ").includes("4 fulle kamper"));
check("faktisk fysio er avsender", medical.sender.name === "Eli Landsem", medical.sender.name);
check("treningsmail bruker program og fokus", training.facts.some((fact) => fact.value === "Kampforberedende") && training.facts.some((fact) => fact.value === "Restforsvar"));
check("treningsmail bærer observasjonspunktet", training.body.join(" ").includes(context.analysisPlan.watch));
check("motstanderbrief bruker faktisk hypotese", opponent.subject.includes("Viking") && opponent.body.join(" ").includes(context.analysisPlan.hypothesis));
check("motstanderbrief bruker motgrep og risiko", opponent.body.join(" ").includes(context.analysisPlan.countermeasureLabel) && opponent.body.join(" ").includes(context.analysisPlan.risk));
check("pressmail lekker ikke rått medietall", !JSON.stringify(press).includes('"72"') && !JSON.stringify(press).includes(":72"));
check("etterkamp bruker faktisk kamp", post.subject.includes("Brann") && post.preview.includes("2–1"));
check("eksisterende signal beholder ID, tråd og kilde", signal.threadId === "captain-thread" && signal.source.threadId === "captain-thread");
check("eksisterende svar blir synlig forklaring", signal.reply.title === "Oppgaven er mottatt" && signal.choices[0].selected);
check("mailene er kronologiske", timeline.messages.every((message, index, list) => index === 0 || list[index - 1].dayIndex < message.dayIndex || (list[index - 1].dayIndex === message.dayIndex && list[index - 1].time <= message.time)));

const early = createClubCommunicationTimeline({ ...context, clubWeekState: { week: 8, phase: "training", mediaPressure: 72 } });
check("framtidige fredag- og søndagsmailer skjules", early.messages.every((message) => message.dayIndex <= 3) && !early.messages.some((message) => message.id.endsWith("opponent-plan")));

const failed = checks.filter((entry) => !entry.ok);
checks.forEach((entry) => console.log(`${entry.ok ? "✓" : "✗"} ${entry.label}${entry.detail ? ` — ${entry.detail}` : ""}`));
if (failed.length) {
  console.error(`\n✗ Klubbkommunikasjon v2 feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Klubbkommunikasjon v2: ${checks.length}/${checks.length}`);
