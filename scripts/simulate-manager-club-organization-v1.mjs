import { createClubOrganizationModel } from "../src/ui/manager-club-organization-v1.js";

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

const model = createClubOrganizationModel({
  clubName: "Rosenborg",
  club: {
    id: "rosenborg",
    name: "Rosenborg",
    ground: "Lerkendal",
    city: "Trondheim",
    homePlaceId: "lerkendal_stadion"
  },
  hiredStaff: [
    { id: "assistant", name: "Assistent", staffType: "assistant_coach" },
    { id: "physio", name: "Fysio", staffType: "physio" }
  ],
  boardExpectation: "Øvre halvdel",
  boardTrust: 58,
  squadCount: 19,
  formation: "4–3–3",
  tactic: "Høyt press",
  trainingProgram: "Formasjonstilvenning",
  trainingFocus: "Press og avstander",
  conditionSignal: "To spillere trenger oppfølging",
  loadSignal: "Middels belastning",
  nextOpponent: "Viking · runde 4",
  development: { expertiseCount: 4, activePrograms: 1, badgeCount: 2 }
});

console.log("\nManager Club Organization v1 simulation");
check("klubbidentiteten bruker canonical hjemmebane", model.clubName === "Rosenborg" && model.ground === "Lerkendal" && model.city === "Trondheim");
check("organisasjonen har to menneskelige/faglige grupper", model.groups.join("|") === "Fotballavdelingen|Klubben");
check("trenerteam er et eksplisitt rom", model.rooms.some((room) => room.id === "coaches" && room.label === "Trenerteam"));
check("treningsanlegget dikter ikke nivå", model.rooms.some((room) => room.id === "training-ground" && /ikke dokumentert/i.test(room.summary)));
check("medisinsk apparat leser faktisk stabsprofil", model.rooms.some((room) => room.id === "medical" && /Fysio/.test(room.summary)));
check("analyse viser aktivt system", model.rooms.some((room) => room.id === "analysis" && room.summary.includes("4–3–3") && room.summary.includes("Høyt press")));
check("styret er organisasjonsrom og ikke rå måler", model.rooms.some((room) => room.id === "board" && /Styret/.test(room.label) && !/58\/100/.test(room.summary)));
check("administrasjon nevner tropp og støtteapparat", model.rooms.some((room) => room.id === "administration" && room.summary.includes("19 spillere") && room.summary.includes("2 i støtteapparatet")));
check("stadion kommer fra klubbdata", model.rooms.some((room) => room.id === "stadium" && room.summary.includes("Lerkendal") && room.summary.includes("Trondheim")));
check("klubbutvikling beholder History Go-arbeidet", model.rooms.some((room) => room.id === "development" && room.actions.some((action) => action.id === "progression")));
check("akademi lages ikke uten datagrunnlag", !model.rooms.some((room) => room.id === "academy"));
check("ingen room-id representerer økonomi marked eller fasilitetsoppgradering", !model.rooms.some((room) => /economy|transfer|market|facility-upgrade/.test(room.id)));

const academyModel = createClubOrganizationModel({
  clubName: "Dataklubb",
  club: { id: "data", name: "Dataklubb", academyName: "Dokumentert akademi" }
});
check("akademi vises når data faktisk finnes", academyModel.rooms.some((room) => room.id === "academy" && room.summary === "Dokumentert akademi"));

console.log(`\nManager Club Organization v1: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
