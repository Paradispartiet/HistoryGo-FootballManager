// HG Football Manager — Formation Library (v1)
//
// Første lesbare visning av det mergede HG Football Manager-datagrunnlaget.
// Modulen er selvstendig og additiv: den leser kun fra data/hgFootball/*,
// rører ikke History Go-kartet, Civication, profil eller PlaceCard, og bygger
// ingen kampmotor. Den fane-registreres via index.html (data-tab-target /
// data-tab-section), og app.js sin generiske initTabs() kobler knappen
// automatisk. Rendringen her er helt frakoblet app.js.
//
// Designprinsipp: ingen formasjonsliste hardkodes i JS. Alt leses fra
// data/hgFootball/formations.json (og epoker/roller/unlock-regler).
import "./football-relationship-metric-ui.js";
import { HISTORICAL_OPPONENT_PROFILES } from "./football-historical-opponent-profiles.js";
import {
  buildFormationKnowledgeIndex,
  buildOpponentProfileIndex,
  createFormationKnowledgeViewModel
} from "./football-formation-knowledge-view-model.js";

const HGFM_DATA = {
  eras: "data/hgFootball/formationEras.json",
  formations: "data/hgFootball/formations.json",
  formationKnowledge: "data/hgFootball/formationKnowledge.json",
  roleTypes: "data/hgFootball/roleTypes.json",
  unlockRules: "data/hgFootball/unlockRules.json"
};

// Norske visningsetiketter for faseformasjoner. Rekkefølgen styrer visningen.
const PHASE_FIELDS = [
  { key: "baseShape", label: "Grunnform" },
  { key: "inPossessionShape", label: "Med ball" },
  { key: "outOfPossessionShape", label: "Uten ball" },
  { key: "pressShape", label: "Press" },
  { key: "lowBlockShape", label: "Lav blokk" },
  { key: "restDefenceShape", label: "Restforsvar" }
];

const DIFFICULTY_LABELS = {
  low: "Lav",
  medium: "Middels",
  high: "Høy",
  very_high: "Svært høy"
};

const TIER_LABELS = {
  start: "Startformasjon",
  early: "Tidlig",
  standard: "Standard",
  advanced: "Avansert"
};

// Liten DOM-hjelper. Holder rendringen lesbar uten et rammeverk.
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "dataset") {
      for (const [dk, dv] of Object.entries(value)) node.dataset[dk] = dv;
    } else {
      node.setAttribute(key, value);
    }
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const child of kids) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

// Bygger en <ul> med chip-elementer fra en liste med strenger. Brukes for
// prinsipper, styrker, svakheter, roller m.m.
function chipList(items, variant) {
  const list = el("ul", { class: `hgfm-chips${variant ? ` hgfm-chips-${variant}` : ""}` });
  (items || []).forEach((item) => list.append(el("li", { class: "hgfm-chip", text: item })));
  if (!list.childElementCount) list.append(el("li", { class: "hgfm-chip hgfm-chip-empty", text: "–" }));
  return list;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Kunne ikke laste ${path}`);
  return response.json();
}

// Slår opp visningsnavn for en roleType-id. Faller tilbake til id-en hvis
// roleTypes-data mangler eller id-en ikke finnes (robusthet uten å kaste).
function roleName(roleId, roleIndex) {
  const role = roleIndex.get(roleId);
  return role ? role.name : roleId;
}

// Leser unlock-data trygt for én formasjon: matcher en regel i unlockRules.json
// og oppsummerer kilde-temaer. Returnerer null hvis ingen regel/feil data, slik
// at visningen kan vise en nøytral status uten å påstå en runtime-tilstand vi
// ikke kan kjenne i denne modulen.
function readUnlockStatus(formationId, unlockState) {
  const { rulesByFormation, sourceNames } = unlockState;
  const rule = rulesByFormation.get(formationId);
  if (!rule) return null;

  const describe = (clause) =>
    (clause || []).map((req) => {
      const sourceName = sourceNames.get(req.sourceType) || req.sourceType;
      return req.theme ? `${sourceName}: ${req.theme}` : sourceName;
    });

  const anyOf = describe(rule.requires?.anyOf);
  const allOf = describe(rule.requires?.allOf);

  return {
    tier: rule.tier,
    tierLabel: TIER_LABELS[rule.tier] || rule.tier || "Ukjent",
    anyOf,
    allOf,
    note: rule.note || null
  };
}

function renderEraList(root, model, onSelectEra) {
  const list = el("div", { class: "hgfm-eras", role: "tablist", "aria-label": "Epoker" });
  model.eras.forEach((era) => {
    const count = model.formationsByEra.get(era.id)?.length || 0;
    const isActive = era.id === model.selectedEraId;
    const button = el(
      "button",
      {
        type: "button",
        class: `hgfm-era-btn${isActive ? " is-active" : ""}`,
        role: "tab",
        "aria-selected": isActive ? "true" : "false",
        dataset: { eraId: era.id }
      },
      [
        el("span", { class: "hgfm-era-period", text: era.period }),
        el("span", { class: "hgfm-era-name", text: era.name }),
        el("span", { class: "hgfm-era-count", text: `${count} formasjon${count === 1 ? "" : "er"}` })
      ]
    );
    button.addEventListener("click", () => onSelectEra(era.id));
    list.append(button);
  });
  root.append(list);
}

function renderFormationList(root, model, onSelectFormation) {
  const wrap = el("div", { class: "hgfm-formations" });
  const era = model.eraIndex.get(model.selectedEraId);
  const formations = model.formationsByEra.get(model.selectedEraId) || [];

  if (era) {
    wrap.append(
      el("div", { class: "hgfm-era-head" }, [
        el("p", { class: "hgfm-era-head-period", text: era.period }),
        el("h3", { class: "hgfm-era-head-name", text: era.name }),
        el("p", { class: "hgfm-era-summary", text: era.summary }),
        el("p", { class: "hgfm-era-shift" }, [
          el("strong", { text: "Taktisk skifte: " }),
          el("span", { text: era.tacticalShift })
        ])
      ])
    );
  }

  const grid = el("div", { class: "hgfm-formation-grid", role: "listbox", "aria-label": "Formasjoner" });
  formations.forEach((formation) => {
    const isActive = formation.id === model.selectedFormationId;
    const card = el(
      "button",
      {
        type: "button",
        class: `hgfm-formation-card${isActive ? " is-active" : ""}`,
        role: "option",
        "aria-selected": isActive ? "true" : "false",
        dataset: { formationId: formation.id }
      },
      [
        el("span", { class: "hgfm-formation-shape", text: formation.baseShape }),
        el("span", { class: "hgfm-formation-name", text: formation.name }),
        el("span", { class: "hgfm-formation-school", text: formation.tacticalSchool || "" }),
        el("span", {
          class: `hgfm-diff hgfm-diff-${formation.tacticalDifficulty || "medium"}`,
          text: DIFFICULTY_LABELS[formation.tacticalDifficulty] || formation.tacticalDifficulty || "–"
        })
      ]
    );
    card.addEventListener("click", () => onSelectFormation(formation.id));
    grid.append(card);
  });

  if (!formations.length) {
    grid.append(el("p", { class: "hgfm-empty", text: "Ingen formasjoner registrert for denne epoken." }));
  }
  wrap.append(grid);
  root.append(wrap);
}

function renderDetail(root, model) {
  const detail = el("div", { class: "hgfm-detail" });
  const formation = model.formationIndex.get(model.selectedFormationId);

  if (!formation) {
    detail.append(el("p", { class: "hgfm-empty", text: "Velg en formasjon for å se det taktiske systemet." }));
    root.append(detail);
    return;
  }

  const era = model.eraIndex.get(formation.eraId);

  // Topp: navn, epoke, skole, periode, vanskelighetsgrad.
  detail.append(
    el("header", { class: "hgfm-detail-head" }, [
      el("p", { class: "hgfm-detail-kicker", text: era ? `${era.name} · ${formation.period}` : formation.period }),
      el("h2", { class: "hgfm-detail-title" }, [
        el("span", { class: "hgfm-detail-shape", text: formation.baseShape }),
        el("span", { text: formation.name })
      ]),
      el("p", { class: "hgfm-detail-school", text: formation.tacticalSchool || "" }),
      (formation.commonNames && formation.commonNames.length
        ? el("p", { class: "hgfm-detail-aka", text: `Også kjent som: ${formation.commonNames.join(", ")}` })
        : null),
      el("div", { class: "hgfm-detail-badges" }, [
        el("span", {
          class: `hgfm-diff hgfm-diff-${formation.tacticalDifficulty || "medium"}`,
          text: `Taktisk vanskelighetsgrad: ${DIFFICULTY_LABELS[formation.tacticalDifficulty] || formation.tacticalDifficulty || "–"}`
        })
      ])
    ])
  );

  // «Bruk denne formasjonen»: kobler biblioteket til det spillbare valget.
  // Setter lagets formasjon (samme selectedFormationId som formationSelect på
  // Lag bruker) via en CustomEvent app.js lytter på — ingen egen datakopi.
  const applyBtn = el(
    "button",
    { type: "button", class: "hgfm-apply-formation", dataset: { applyFormationId: formation.id } },
    [el("span", { text: `Bruk ${formation.name} i laget` })]
  );
  applyBtn.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("hgfm:apply-formation", {
      detail: { formationId: formation.id, name: formation.name }
    }));
  });
  detail.append(applyBtn);
  // app.js skriver hit hvis formasjonen ikke er låst opp ennå (klar
  // tilbakemelding i stedet for en stille blindvei).
  detail.append(el("p", { class: "hgfm-apply-status", id: "hgfmApplyStatus" }));

  if (formation.notes) {
    detail.append(el("p", { class: "hgfm-detail-notes", text: formation.notes }));
  }

  const knowledgeVm = createFormationKnowledgeViewModel({
    formation,
    knowledge: model.knowledgeById[formation.id],
    roleIndex: model.roleIndex,
    opponentIndex: model.opponentIndex
  });
  if (knowledgeVm) {
    detail.append(
      el("section", { class: "hgfm-block hgfm-knowledge" }, [
        el("h3", { class: "hgfm-block-title", text: "Kunnskap i spill" }),
        el("p", { class: "hgfm-knowledge-core", text: knowledgeVm.corePrinciple }),
        el("div", { class: "hgfm-two-col" }, [
          el("div", {}, [
            el("p", { class: "hgfm-unlock-label", text: "Matchup-signaler" }),
            chipList(knowledgeVm.matchupSignals, "signal")
          ]),
          el("div", {}, [
            el("p", { class: "hgfm-unlock-label", text: "Læringspunkter" }),
            chipList(knowledgeVm.learningPoints, "learning")
          ])
        ]),
        knowledgeVm.relatedOpponentLabels.length
          ? el("details", { class: "hgfm-knowledge-details" }, [
              el("summary", { text: "Relaterte historiske motstandere" }),
              chipList(knowledgeVm.relatedOpponentLabels, "example")
            ])
          : null
      ])
    );
  }

  // Faseformasjoner: grunnform + de fem fasene.
  const phaseGrid = el("div", { class: "hgfm-phase-grid" });
  PHASE_FIELDS.forEach(({ key, label }) => {
    phaseGrid.append(
      el("div", { class: "hgfm-phase-box" }, [
        el("span", { class: "hgfm-phase-label", text: label }),
        el("span", { class: "hgfm-phase-value", text: formation[key] || "–" })
      ])
    );
  });
  detail.append(
    el("section", { class: "hgfm-block" }, [
      el("h3", { class: "hgfm-block-title", text: "Faseformasjoner" }),
      phaseGrid
    ])
  );

  // Prinsipper / styrker / svakheter.
  detail.append(
    el("section", { class: "hgfm-block" }, [
      el("h3", { class: "hgfm-block-title", text: "Prinsipper" }),
      chipList(formation.principles, "principle")
    ])
  );
  detail.append(
    el("div", { class: "hgfm-two-col" }, [
      el("section", { class: "hgfm-block" }, [
        el("h3", { class: "hgfm-block-title", text: "Styrker" }),
        chipList(formation.strengths, "strength")
      ]),
      el("section", { class: "hgfm-block" }, [
        el("h3", { class: "hgfm-block-title", text: "Svakheter" }),
        chipList(formation.weaknesses, "weakness")
      ])
    ])
  );

  // Nøkkelroller (roleRequirements) med visningsnavn fra roleTypes.json.
  const roleNames = (formation.roleRequirements || []).map((id) => roleName(id, model.roleIndex));
  detail.append(
    el("section", { class: "hgfm-block" }, [
      el("h3", { class: "hgfm-block-title", text: "Nøkkelroller" }),
      chipList(roleNames, "role")
    ])
  );

  // Historiske eksempler.
  detail.append(
    el("section", { class: "hgfm-block" }, [
      el("h3", { class: "hgfm-block-title", text: "Historiske eksempler" }),
      chipList(formation.historicalExamples, "example")
    ])
  );

  // Unlock-status (lest trygt fra unlockRules.json + formation.unlockLinks).
  const unlock = readUnlockStatus(formation.id, model.unlockState);
  const unlockBlock = el("section", { class: "hgfm-block hgfm-unlock" }, [
    el("h3", { class: "hgfm-block-title", text: "Opplåsing i History Go" })
  ]);
  if (unlock) {
    unlockBlock.append(
      el("p", { class: "hgfm-unlock-tier" }, [
        el("span", { class: `hgfm-tier hgfm-tier-${unlock.tier || "standard"}`, text: unlock.tierLabel })
      ])
    );
    if (unlock.allOf.length) {
      unlockBlock.append(el("p", { class: "hgfm-unlock-label", text: "Krever alle:" }));
      unlockBlock.append(chipList(unlock.allOf, "unlock"));
    }
    if (unlock.anyOf.length) {
      unlockBlock.append(el("p", { class: "hgfm-unlock-label", text: "Låses opp av (én holder):" }));
      unlockBlock.append(chipList(unlock.anyOf, "unlock"));
    }
    if (unlock.note) unlockBlock.append(el("p", { class: "hgfm-unlock-note", text: unlock.note }));
  } else if (formation.unlockLinks && formation.unlockLinks.length) {
    const links = formation.unlockLinks.map((link) => {
      const sourceName = model.unlockState.sourceNames.get(link.sourceType) || link.sourceType;
      return link.theme ? `${sourceName}: ${link.theme}` : sourceName;
    });
    unlockBlock.append(el("p", { class: "hgfm-unlock-label", text: "Mulige koblinger:" }));
    unlockBlock.append(chipList(links, "unlock"));
  } else {
    unlockBlock.append(
      el("p", { class: "hgfm-unlock-note", text: "Ingen spesifikk opplåsingsregel definert for denne formasjonen ennå." })
    );
  }
  detail.append(unlockBlock);

  root.append(detail);
}

function render(container, model, handlers) {
  container.innerHTML = "";
  const layout = el("div", { class: "hgfm-layout" });
  const left = el("div", { class: "hgfm-col hgfm-col-eras" });
  const mid = el("div", { class: "hgfm-col hgfm-col-formations" });
  const right = el("div", { class: "hgfm-col hgfm-col-detail" });

  renderEraList(left, model, handlers.onSelectEra);
  renderFormationList(mid, model, handlers.onSelectFormation);
  renderDetail(right, model);

  layout.append(left, mid, right);
  container.append(layout);
}

// Bygger oppslagsindekser og grupperer formasjoner per epoke. Epoke-rekkefølgen
// følger formationEras.json (kronologisk).
function buildModel(erasData, formationsData, roleTypesData, unlockRulesData, formationKnowledgeData) {
  const eras = Array.isArray(erasData?.eras) ? erasData.eras : [];
  const formations = Array.isArray(formationsData?.formations) ? formationsData.formations : [];
  const roleTypes = Array.isArray(roleTypesData?.roleTypes) ? roleTypesData.roleTypes : [];

  const eraIndex = new Map(eras.map((era) => [era.id, era]));
  const formationIndex = new Map(formations.map((f) => [f.id, f]));
  const roleIndex = new Map(roleTypes.map((r) => [r.id, r]));
  const knowledgeById = buildFormationKnowledgeIndex(formationKnowledgeData);
  const opponentIndex = buildOpponentProfileIndex(HISTORICAL_OPPONENT_PROFILES);

  // Grupper formasjoner per eraId, i den rekkefølgen de står i formations.json.
  const formationsByEra = new Map();
  eras.forEach((era) => formationsByEra.set(era.id, []));
  formations.forEach((f) => {
    if (!formationsByEra.has(f.eraId)) formationsByEra.set(f.eraId, []);
    formationsByEra.get(f.eraId).push(f);
  });

  // Unlock-state: regler per formationId + kilde-navn (trygt, read-only).
  const rules = Array.isArray(unlockRulesData?.rules) ? unlockRulesData.rules : [];
  const rulesByFormation = new Map();
  rules
    .filter((rule) => rule.appliesTo === "formation" && rule.formationId)
    .forEach((rule) => rulesByFormation.set(rule.formationId, rule));
  const sourceNames = new Map(
    (Array.isArray(unlockRulesData?.unlockSources) ? unlockRulesData.unlockSources : []).map((s) => [s.id, s.name])
  );

  return {
    eras,
    formations,
    eraIndex,
    formationIndex,
    roleIndex,
    knowledgeById,
    opponentIndex,
    formationsByEra,
    unlockState: { rulesByFormation, sourceNames },
    selectedEraId: eras[0]?.id || null,
    selectedFormationId: null
  };
}

async function initFormationLibrary() {
  const container = document.getElementById("hgfmLibraryRoot");
  if (!container) return;

  try {
    const [erasData, formationsData, roleTypesData, unlockRulesData, formationKnowledgeData] = await Promise.all([
      loadJson(HGFM_DATA.eras),
      loadJson(HGFM_DATA.formations),
      // roleTypes og unlockRules er valgfrie for visningen: ved feil faller vi
      // tilbake til id-er / nøytral unlock-status uten å kaste.
      loadJson(HGFM_DATA.roleTypes).catch(() => null),
      loadJson(HGFM_DATA.unlockRules).catch(() => null),
      loadJson(HGFM_DATA.formationKnowledge).catch(() => null)
    ]);

    const model = buildModel(erasData, formationsData, roleTypesData, unlockRulesData, formationKnowledgeData);

    // Velg første formasjon i første epoke som standard.
    const firstFormations = model.formationsByEra.get(model.selectedEraId) || [];
    model.selectedFormationId = firstFormations[0]?.id || model.formations[0]?.id || null;

    const countEl = document.getElementById("hgfmFormationCount");
    if (countEl) countEl.textContent = String(model.formations.length);

    const handlers = {
      onSelectEra(eraId) {
        model.selectedEraId = eraId;
        const list = model.formationsByEra.get(eraId) || [];
        model.selectedFormationId = list[0]?.id || null;
        render(container, model, handlers);
      },
      onSelectFormation(formationId) {
        model.selectedFormationId = formationId;
        // Hold epoke i synk hvis formasjonen tilhører en annen epoke.
        const formation = model.formationIndex.get(formationId);
        if (formation && formation.eraId !== model.selectedEraId && model.eraIndex.has(formation.eraId)) {
          model.selectedEraId = formation.eraId;
        }
        render(container, model, handlers);
      }
    };

    render(container, model, handlers);
  } catch (error) {
    container.innerHTML = "";
    container.append(
      el("p", { class: "hgfm-error" }, [
        `Kunne ikke laste formasjonsbiblioteket: ${error.message}. `,
        "Kjør prosjektet via en lokal server eller GitHub Pages."
      ])
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFormationLibrary);
} else {
  initFormationLibrary();
}

export { initFormationLibrary };
