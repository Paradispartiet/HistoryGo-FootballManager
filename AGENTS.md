# AGENTS.md

Denne filen er bindende arbeidsinstruks for kodeagenter og assistenter som arbeider i `Paradispartiet/HistoryGo-FootballManager`.

## Prosjektmiljø: GitHub CLI er installert

**Ikke konkluder med at prosjektet mangler `gh`.**

Repoets `.devcontainer/devcontainer.json` installerer den offisielle Dev Container-featuren:

```json
{
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
```

Det betyr at **GitHub CLI er en del av prosjektets deklarerte Codespace/devcontainer-miljø**.

Hvis en tilfeldig assistent-runtime, verktøysandbox eller annen midlertidig prosess svarer `gh: command not found`, betyr det bare at den aktuelle runtime-en ikke er prosjektets devcontainer. Det skal **aldri** omskrives til «repoet/prosjektet har ikke gh», og brukeren skal ikke bes om å installere `gh` på nytt.

Ved en slik runtime-begrensning skal agenten:

1. kontrollere `.devcontainer/devcontainer.json`;
2. behandle repoets deklarerte devcontainer som fasit for prosjektets verktøy;
3. bruke tilgjengelig GitHub-connector/API som fallback i den aktuelle økten dersom shell-runtime-en ikke er prosjektmiljøet;
4. aldri foreslå ny `gh`-installasjon med mindre devcontainer-konfigurasjonen faktisk er fjernet eller ødelagt.

Denne regelen finnes fordi `gh` allerede er installert og har blitt verifisert flere ganger. Gjentatte installasjonsforslag skaper unødvendig dobbeltarbeid.

## Publiseringsregel

Når brukeren ber om implementering i repoet, er arbeidet normalt ikke ferdig ved lokal endring. Standardmålet er:

```text
implementer → commit → push → PR → full CI → squash merge til main → verifiser main/deploy → rydd feature-branch og midlertidige artefakter
```

Ikke la en midlertidig shell-begrensning stoppe dette dersom GitHub-connectoren kan fullføre arbeidsflyten.

## Repository-hygiene

Feature-brancher under `agent/` og `claude/` er **midlertidige arbeidsrefs**, ikke prosjektarkiv. Når en PR er squash-merget, skal head-branchen slettes. `.github/workflows/branch-hygiene.yml` er sikkerhetsnettet som rydder mergede head-brancher etter push til `main`; det erstatter ikke agentens ansvar for å avslutte arbeidet ryddig.

Ikke la tekniske mellombrancher som `-clean`, `-anchor`, `-2`, `-3` eller tilsvarende bli stående etter at den endelige leveransen er merget. Hvis en slik branch faktisk inneholder unikt, umerget arbeid, må det avklares og flyttes inn i en eksplisitt PR før opprydding.

Repoet skal heller ikke brukes som lager for engangsnotater fra implementeringen. Før merge skal agenten skille mellom:

- **permanente kontrakter, tester, audits og dokumentasjon** som beskytter produktet videre; og
- **midlertidige QA-rapporter, CI-markører, debugging-filer, engangssimuleringer og implementation notes** som bare beskriver arbeidet som nettopp ble gjort.

Den første gruppen beholdes. Den andre gruppen skal inn i PR-beskrivelsen eller fjernes før oppgaven regnes som ferdig. Ikke opprett en ny permanent audit eller dokumentfil for hver liten feature dersom eksisterende kontrakter kan utvides.

Opprydding skal være konservativ på runtime-kode: navn som `legacy`, `compat` eller `migration` er ikke i seg selv grunn til sletting. Før kode fjernes må aktive imports, save-migrering, DOM-referanser, eventlisteners og tester være kartlagt slik at kompatibilitet ikke brytes.

## Produktretning

Les `docs/PRODUCT_PRINCIPLES_CLUB_SIMULATION.md` før nye større managerfunksjoner designes.

Kortversjonen er:

> History Go lar brukeren oppdage fotballen. HG Football Manager lar brukeren gå inn i klubben og forstå hvordan fotballarbeidet faktisk utføres.

HG Football Manager er først og fremst en lærings- og klubbdriftssimulering, ikke en kopi av kommersielle managerspill. Ikke bygg abstrakte økonomi-, kontrakts-, markeds- eller fasilitetsnivåsystemer bare fordi slike systemer finnes i Football Manager.
