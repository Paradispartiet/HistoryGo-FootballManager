const SETTINGS_ICON = `
  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3.2"/>
    <path d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V19a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1H4a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.56V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.56 1H20a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/>
  </svg>`;

class ManagerClubHeader extends HTMLElement {
  connectedCallback() {
    if (this.firstElementChild) return;
    this.innerHTML = `
      <header class="site-header" id="clubIdentityHeader">
        <div class="header-inner">
          <div class="club-identity-mark" id="headerClubMark" aria-hidden="true">HG</div>
          <div class="header-title">
            <p class="eyebrow" id="headerClubName">HG Football Manager</p>
            <h1>Managerkontoret</h1>
            <p class="lede" id="headerClubManager">Treneren avgjør. Les klubbens puls, bygg laget på banen og ta de neste beslutningene.</p>
            <p class="club-ground-line" id="headerClubGround" hidden></p>
          </div>
          <button type="button" class="settings-button" id="settingsButton" data-modal-open="modalSettings" aria-label="Innstillinger" title="Innstillinger">
            ${SETTINGS_ICON}
          </button>
        </div>
      </header>`;
  }
}
class ManagerNextAction extends HTMLElement {
  connectedCallback() {
    if (this.firstElementChild) return;
    this.innerHTML = `
      <footer class="site-footer">
        <section class="next-action-strip" id="nextActionStrip" aria-label="Neste handling" aria-live="polite">
          <div class="next-action-head">
            <p class="eyebrow">Neste handling</p>
            <span class="next-action-phase" id="nextActionPhase">Uke 1 · Analyse</span>
          </div>
          <button type="button" class="next-action-primary" id="nextActionPrimary">
            <span class="next-action-tag" id="nextActionPrimaryTag">Lag</span>
            <span class="next-action-title" id="nextActionPrimaryTitle">Gjør laget klart</span>
            <span class="next-action-hint" id="nextActionPrimaryHint">Fyll laget for å komme i gang.</span>
          </button>
          <div class="next-action-secondary" id="nextActionSecondary" role="group" aria-label="Andre naturlige steg"></div>
        </section>
      </footer>`;
  }
}

if (typeof customElements !== "undefined") {
  if (!customElements.get("manager-club-header")) customElements.define("manager-club-header", ManagerClubHeader);
  if (!customElements.get("manager-next-action")) customElements.define("manager-next-action", ManagerNextAction);
}
