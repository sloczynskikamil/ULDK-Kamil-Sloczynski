import "@vaadin/vaadin-radio-button/vaadin-radio-button.js";
import "@vaadin/vaadin-radio-button/vaadin-radio-group.js";
import L from "leaflet";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./popup";

@customElement("custom-panel")
export class UldkPanel extends LitElement {
  constructor() {
    super();
    this.selected = "fullData";
  }

  static styles = css`
    :host {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 10px;
      background-color: rgb(255 255 255 / 85%);
      font-family: Bahnschrift;
      font-weight: bold;
      min-width: 250px;
    }
  `;

  @property({ type: String }) selected?: any;
  @property({ type: Object }) map?: L.Map;

  render() {
    return html`
      <h2>ULDK</h2>
      <vaadin-radio-group
        id="radio"
        @value-changed="${this.onValueChanged}"
        .value="${this.selected}"
        label="Wyszukaj po..."
      >
        <vaadin-radio-button value="fullData">składowych identyfikatora</vaadin-radio-button>
        <vaadin-radio-button value="byID">pełnym identyfikatorze</vaadin-radio-button>
      </vaadin-radio-group>
      <custom-popup
        .map=${this.map}
        .selected=${this.selected}
      ></custom-popup>
    `;
  }

  onValueChanged(e) {
    this.selected = e.detail.value;
  }
}
