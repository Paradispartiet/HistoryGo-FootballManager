# HG Football Manager – datafiler v1

Denne pakken legger opp til denne kjerneløkken:

Sted → Person → Ekspertise → Trening → Badge → Lagklasse

## Filer

- `football_unlocks.json`
  - Definerer hva hvert History Go-sted låser opp.
  - KFUM Arena gir trenerkandidater og ekspertise, ikke spillere.

- `football_staff.json`
  - Definerer stabskandidater.
  - `isPlaceholder: true` betyr at personen/profilen er en midlertidig spillprofil og må forskes på før den behandles som virkelig persondata.

- `football_expertise.json`
  - Definerer kunnskapen som steder og personer kan gi.

- `football_training_programs.json`
  - Definerer treningsprogrammer som kan brukes i treningsuker.

- `football_training_badges.json`
  - Definerer badge-katalogen.
  - 28 familier × bronse/sølv/gull = 84 treningsbadges.

- `football_team_classifications.json`
  - Definerer lagklasser som Overgangslag, Presslag, Kontrollag osv.

- `football_team_merits.example.json`
  - Eksempel på lagets aktive meritter, ansatte og treningsprogresjon.

## Fast prinsipp

Football Manager skal ikke ha fri tilgang til alle spillere og all stab.
Det skal filtreres gjennom History Go-progresjon:

1. Brukeren besøker/samler et sportsted.
2. Stedet låser opp personer, ekspertise og treningsmodeller.
3. Personen kan engasjeres i stab.
4. Staben gjør treningsprogrammer tilgjengelige.
5. Treningsprogrammer gir badges.
6. Badges gir kampfordeler og lagidentitet.

## Neste kodesteg

Legg til disse filene under `data/` i `Paradispartiet/HistoryGo-FootballManager`.

Deretter bør `src/app.js` utvides med:

- lasting av `football_unlocks.json`
- lasting av `football_staff.json`
- lasting av `football_expertise.json`
- lasting av `football_training_programs.json`
- lasting av `football_training_badges.json`
- en unlock-funksjon som filtrerer tilgjengelige personer og ekspertise basert på besøkte History Go-steder
