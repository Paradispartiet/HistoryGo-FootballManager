// Four connected tactical actions, an opponent counter and a possible reply.
// Football coaching hypotheses, not claims that the exact actions occurred.
// See docs/kampplaner.md for source references and limitations.
export const TACTICAL_SEQUENCES = Object.freeze([
  {
    "tacticId": "central_possession_4231",
    "title": "Sentralt overtall",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 65
    },
    "requires": {
      "buildUpScore": 63,
      "depthScore": 58
    },
    "moves": [
      "Trekk stopperpresset mot ballen",
      "Bind sekser med støttespiller",
      "Finn tredjemann i mellomrommet",
      "Løp inn bak deres neste ledd"
    ],
    "counter": "Stenger sentral sekser og tier",
    "response": "Vend via motsatt back og angrip halvrom",
    "counterCondition": {
      "trait": "pressIntensity",
      "min": 78
    }
  },
  {
    "tacticId": "patient_build_up",
    "title": "Spille fri tredjemann",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 70
    },
    "requires": {
      "buildUpScore": 67,
      "balanceScore": 62
    },
    "moves": [
      "Inviter frem første pressledd",
      "Bruk keeper som pasningsstøtte",
      "Spill gjennom ledig sekser",
      "Gå frem med overtall bak presset"
    ],
    "counter": "Låser keeper og sekser samtidig",
    "response": "Spill kontrollert lengre til bred støtte",
    "counterCondition": {
      "trait": "tacticalComplexity",
      "min": 79
    }
  },
  {
    "tacticId": "positional_overloads",
    "title": "Overtall og isolasjon",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 64
    },
    "requires": {
      "buildUpScore": 65,
      "widthScore": 63
    },
    "moves": [
      "Samle spillere til ballside",
      "Bind deres back med indreløper",
      "Vend gjennom tredjemann",
      "Isoler kantspiller på svak side"
    ],
    "counter": "Forskyver kompakt mot begge sider",
    "response": "Angrip halvrommet der midtbanen forlot posisjon",
    "counterCondition": {
      "trait": "tacticalComplexity",
      "min": 80
    }
  },
  {
    "tacticId": "high_press_343",
    "title": "Koordinert pressfelle",
    "opponentCondition": {
      "trait": "shortBuildUp",
      "min": 65
    },
    "requires": {
      "pressScore": 65,
      "balanceScore": 60,
      "restDefenseScore": 59
    },
    "moves": [
      "Styr første pasning ut mot kant",
      "Steng returen til keeper",
      "Press med back og spiss samtidig",
      "Sikre bakrom og vinn andreball"
    ],
    "counter": "Spiller direkte bak vingback",
    "response": "Senk presshøyde og la sekser sikre",
    "counterCondition": {
      "trait": "pressResistance",
      "min": 79
    }
  },
  {
    "tacticId": "counter_press_recovery",
    "title": "Gjenvinning før overgang",
    "opponentCondition": {
      "trait": "transitionThreat",
      "min": 66
    },
    "requires": {
      "pressScore": 65,
      "restDefenseScore": 62
    },
    "moves": [
      "Sikre bak ball før angrep",
      "Press umiddelbart etter balltap",
      "Steng første fremoverpasning",
      "Vinn andreball og angrip igjen"
    ],
    "counter": "Vender seg forbi pressleddet",
    "response": "Avbryt presset og organiser blokk",
    "counterCondition": {
      "trait": "pressResistance",
      "min": 78
    }
  },
  {
    "tacticId": "midfield_press_trap",
    "title": "Fange pasningen i midten",
    "opponentCondition": {
      "trait": "possessionControl",
      "min": 65
    },
    "requires": {
      "pressScore": 59,
      "balanceScore": 62
    },
    "moves": [
      "La stoppere føre ballen frem",
      "Skjerm den sentrale mottakeren",
      "Press pasningen gjennom midten",
      "Vend direkte etter gjenvinning"
    ],
    "counter": "Vender ut til motsatt back",
    "response": "Skyv midtblokken samlet mot ny ballside",
    "counterCondition": {
      "trait": "tacticalComplexity",
      "min": 78
    }
  },
  {
    "tacticId": "direct_counter_442",
    "title": "Lokk høyt og angrip bak",
    "opponentCondition": {
      "trait": "highLine",
      "min": 64
    },
    "requires": {
      "depthScore": 64,
      "balanceScore": 58
    },
    "moves": [
      "Stå kompakt i to ledd",
      "Vinn ballen sentralt",
      "Slipp pasningen forbi høy back",
      "La to spisser angripe ulike rom"
    ],
    "counter": "Lar bakerste stopper falle av",
    "response": "Bruk avlegg til innløpende midtbane",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 81
    }
  },
  {
    "tacticId": "low_block_transition_541",
    "title": "Fra lav blokk til overgang",
    "opponentCondition": {
      "trait": "possessionControl",
      "min": 67
    },
    "requires": {
      "restDefenseScore": 66,
      "depthScore": 59
    },
    "moves": [
      "Beskytt rommet foran egen boks",
      "Tving angrepet ut mot kanten",
      "Vinn ballen med støtte for første pasning",
      "Slipp spiss og vingback raskt frem"
    ],
    "counter": "Sikrer bak ballen med flere spillere",
    "response": "Flytt laget frem som enhet før neste utløsning",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 80
    }
  },
  {
    "tacticId": "deep_block_long_release",
    "title": "Forsvar og andreball",
    "opponentCondition": {
      "trait": "highLine",
      "min": 64
    },
    "requires": {
      "restDefenseScore": 63,
      "balanceScore": 61,
      "depthScore": 58
    },
    "moves": [
      "Forsvar boks og første innlegg",
      "Vinn første eller andre ball",
      "Spill tidlig mot spissen",
      "Støtt avlegget med midtbaneløp"
    ],
    "counter": "Dekker nedfallsrommet godt",
    "response": "Spill via vingback før lengre ball",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 81
    }
  },
  {
    "tacticId": "direct_second_balls",
    "title": "Forbi press og vinn nedfallsrom",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 68
    },
    "requires": {
      "balanceScore": 62,
      "depthScore": 60
    },
    "moves": [
      "Lokke første pressledd",
      "Slå langt bak presslinjen",
      "Samle midtbanen rundt første duell",
      "Vinn andreball og angrip neste rom"
    ],
    "counter": "Pakker rommet rundt andreballen",
    "response": "Spill kort via tredjemann før langpasningen",
    "counterCondition": {
      "trait": "defensiveCompactness",
      "min": 78
    }
  },
  {
    "tacticId": "target_man_focus",
    "title": "Festepunkt og tredje løp",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 65
    },
    "requires": {
      "balanceScore": 62,
      "depthScore": 57
    },
    "moves": [
      "Finn spissens føtter eller kropp",
      "Gi nær støtte ved første duell",
      "Legg av til møtende indreløper",
      "Slipp løper rundt stoppere"
    ],
    "counter": "Dobler på mottaksspiss",
    "response": "Flytt første pasning ut i halvrom",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 79
    }
  },
  {
    "tacticId": "wide_fast_433",
    "title": "Isoler kant ved sideskifte",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 64
    },
    "requires": {
      "widthScore": 65,
      "depthScore": 61
    },
    "moves": [
      "Bind sekser med sentral støtte",
      "Dra backen inn mot ballen",
      "Vend tidlig til bred kantspiller",
      "Angrip én mot én med boksløp"
    ],
    "counter": "Dobler opp mot kantspilleren",
    "response": "Bruk underlapp eller bytt side igjen",
    "counterCondition": {
      "trait": "tacticalComplexity",
      "min": 80
    }
  },
  {
    "tacticId": "crossing_box_presence",
    "title": "Åpne bredde, fylle boks",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 63
    },
    "requires": {
      "widthScore": 65,
      "depthScore": 59,
      "balanceScore": 57
    },
    "moves": [
      "Trekk blokk mot første side",
      "Skap to mot én på kanten",
      "Fyll boks med ulike løpsbaner",
      "Sikre andreball ved boksgrensen"
    ],
    "counter": "Vinner første innlegg og rydder unna",
    "response": "Spill bakover til lavt innlegg",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 80
    }
  },
  {
    "tacticId": "overlap_channels",
    "title": "Overlapp med kontrollert sikring",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 62
    },
    "requires": {
      "widthScore": 64,
      "restDefenseScore": 61
    },
    "moves": [
      "Trekk back innover via kant",
      "Start overlapp rundt motstanderback",
      "Finn tredjemann i halvrommet",
      "Slå innlegg med sekser som sikring"
    ],
    "counter": "Kontrer bak høy vingback",
    "response": "Senk motsatt back og la sekser sikre",
    "counterCondition": {
      "trait": "transitionThreat",
      "min": 78
    }
  },
  {
    "tacticId": "see_out_the_game",
    "title": "Stenge midten ved ledelse",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 70
    },
    "requires": {
      "restDefenseScore": 68,
      "balanceScore": 67
    },
    "moves": [
      "Senk risiko ved egne balltap",
      "Hold midtbane tett på bakre ledd",
      "Styr motstander til siden",
      "Vinn returer og hold ballen"
    ],
    "counter": "Sender en ekstra løper mellom leddene",
    "response": "Flytt sekser mot løper og behold kontringsutgang",
    "counterCondition": {
      "trait": "tacticalComplexity",
      "min": 81
    }
  },
  {
    "tacticId": "chase_the_equaliser",
    "title": "Koordinert slutttrykk",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 64
    },
    "requires": {
      "pressScore": 65,
      "widthScore": 63,
      "depthScore": 59
    },
    "moves": [
      "Løft hele pressleddet sammen",
      "Steng første kant med back og ving",
      "Vend raskt til motsatt side",
      "Angrip boks med spiss og indreløper"
    ],
    "counter": "Kontrer mot to høye backer",
    "response": "Hold sekser igjen og send én back frem",
    "counterCondition": {
      "trait": "transitionThreat",
      "min": 79
    }
  },
  {
    "tacticId": "slow_it_down",
    "title": "Rytmebrudd og trygg vending",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 68
    },
    "requires": {
      "buildUpScore": 67,
      "balanceScore": 64
    },
    "moves": [
      "Gi ballfører to støttelinjer",
      "Lokke motstanderpresset frem",
      "Vend via keeper og sekser",
      "Behold ballen bak presset"
    ],
    "counter": "Mannmarker begge pasningsstøtter",
    "response": "Søk tredjemann lengre frem",
    "counterCondition": {
      "trait": "tacticalComplexity",
      "min": 80
    }
  },
  {
    "tacticId": "all_out_attack",
    "title": "Risiko med kontrollert retur",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 64
    },
    "requires": {
      "pressScore": 69,
      "widthScore": 67,
      "depthScore": 63
    },
    "moves": [
      "Press kollektivt svært høyt",
      "Hold én back bred og én som sikring",
      "Spill tidlig til fri kanal",
      "Fyll boks og sikre returen"
    ],
    "counter": "Spiller lang kontring bak fremste ledd",
    "response": "Trekk sekser ned eller senk presset",
    "counterCondition": {
      "trait": "transitionThreat",
      "min": 75
    }
  }
]);

const finite = (x) => typeof x === "number" && Number.isFinite(x);
const matches = (traits, condition) => finite(traits?.[condition.trait]) &&
  traits[condition.trait] >= condition.min;

// Never treat the four moves as four free independent bonuses. A complete
// chain has at most one modest match advantage; a response can neutralize it.
export function evaluateTacticalSequences(tacticId, opponent, tacticalProfile) {
  if (!opponent?.styleTraits || !tacticalProfile) return [];
  // Some defensive qualities (pressResistance/defensiveStructure) are top-level
  // on the historical profile; tactical style traits are nested.
  const strengths = { ...opponent, ...opponent.styleTraits };
  return TACTICAL_SEQUENCES.filter((pattern) => pattern.tacticId === tacticId &&
    matches(strengths, pattern.opponentCondition))
    .map((pattern) => {
      const missing = Object.entries(pattern.requires)
        .filter(([metric, threshold]) => !finite(tacticalProfile[metric]) ||
          tacticalProfile[metric] < threshold)
        .map(([metric, minimum]) => ({ metric, minimum,
          actual: finite(tacticalProfile[metric]) ? tacticalProfile[metric] : null }));
      const ready = missing.length === 0;
      // An unknown opponent countermeasure is NOT proof that it is absent.
      // Do not award a tactical advantage until both the vulnerability and
      // the relevant opponent response are actually represented in the profile.
      const counterKnown = finite(strengths[pattern.counterCondition.trait]);
      const countered = ready && counterKnown && matches(strengths, pattern.counterCondition);
      return { id: pattern.tacticId, title: pattern.title,
        moves: pattern.moves.slice(), counter: pattern.counter,
        response: pattern.response, missing, ready, countered,
        status: !ready ? "unsupported"
          : !counterKnown ? "unknown_counter"
          : countered ? "countered" : "advantage",
        edgeDelta: ready && counterKnown && !countered ? 1 : 0 };
    });
}
