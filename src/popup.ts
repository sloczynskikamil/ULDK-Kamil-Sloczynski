import "@vaadin/vaadin-button";
import "@vaadin/vaadin-combo-box";
import "@vaadin/vaadin-text-field";
import L from "leaflet";
import {
  LitElement,
  state,
  html,
  property,
  customElement,
  css,
  query,
} from "lit-element";
import { UldkApi } from "./api";

interface uldkItem {
  name: string;
  teryt: string;
}

@customElement("custom-popup")
class UldkPopup extends LitElement {
  constructor() {
    super();
  }
  static styles = css`
    :host {
      position: absolute;
      top: 180px;
      right: 0;
      padding: 10px;
      background-color: rgb(255 255 255 / 85%);
      min-width: 250px;
      overflow: auto;
      font-family: Bahnschrift;
      font-weight: bold;
    }

    vaadin-combo-box {
      width: 100%;
    }
  `;

  @state() geojsonLayer: any = undefined;

  @property({ type: String }) inputValue?: string;

  @property({ type: Object }) map?: L.Map;
  @property({ type: String }) set selected(selected: string) {
    const oldValue = this._selected;

    this._selected = selected;
    this.requestUpdate(oldValue);
  }

  @query("#voivodeship")
  voivodeshipNode: any;

  @query("#county")
  countyNode: any;

  @query("#commune")
  communeNode: any;

  @query("#region")
  regionNode: any;

  @query("#parcelNr")
  parcelInput: any;

  firstUpdated(props: any) {
    super.firstUpdated(props);
  }

  private _selected!: string;
  private uldkapi: UldkApi = new UldkApi();

  async showPopup(
    type: string,
    teryt: string = "",
    voivodeship: any = "",
    county: any = "",
    commune: any = "",
    region: any = "",
    parcelId: any = "",
  ) {

    if (!this.geojsonLayer) {
      this.geojsonLayer = L.geoJSON(undefined, {
        onEachFeature: (feature, layer) => {
          layer.bindPopup(
            `<h3>DATA:</h3>
              <p><b>Teryt: </b>${feature.properties.teryt}</p>
              <p><b>Nr działki: </b>${feature.properties.parcelId}</p>,
              <p><b>Województwo: </b>${feature.properties.voivodeship}</p>
              <p><b>Powiat: </b>${feature.properties.county}</p>
              <p><b>Gmina: </b>${feature.properties.commune}</p>
              <p><b>Region: </b>${feature.properties.region}</p>`

          );
        },
      }).addTo(this.map!);
    }

    this.geojsonLayer.clearLayers();

    const wktJSON = await this.uldkapi.getParcels(type, teryt, null);
    const dataJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: wktJSON,
          properties: {
            teryt: teryt,
            voivodeship: voivodeship,
            county: county,
            commune: commune,
            region: region,
            parcelId: parcelId,
            underConstruction: false,
          },
          id: 1,
        },
      ],
    };

    if (!wktJSON) {
      return false;
    }

    this.geojsonLayer?.addData(dataJSON);
    this.map?.fitBounds(this.geojsonLayer.getBounds());

    return "";
  }

  render() {
    switch (this.selected) {
      case "fullData": {
        return html`
          <vaadin-combo-box
            id="voivodeship"
            label="Wybierz województwo"
            clear-button-visible
            item-label-path="name"
            item-value-path="teryt"
            @selected-item-changed=${() => {
              this.countyNode.value = "";
              this.countyNode.items = [];
              this.countyNode.selectedItem = undefined;
            }}
            .dataProvider=${async (params, callback) => {
              let data = await this.uldkapi.getAdministrativeNames(
                "Wojewodztwo",
              );

              callback(data, data.length);
            }}
            @change=${async (e) => {
              this.countyNode.items = await this.uldkapi.getAdministrativeNames(
                "Powiat",
                e.target.value,
              );
            }}
          >
          </vaadin-combo-box>
          <vaadin-combo-box
            id="county"
            label="Wybierz powiat"
            clear-button-visible
            item-label-path="name"
            item-value-path="teryt"
            @selected-item-changed=${() => {
              this.communeNode.value = "";
              this.communeNode.items = [];
              this.communeNode.selectedItem = undefined;
            }}
            @change=${async (e) => {
              this.communeNode.items =
                await this.uldkapi.getAdministrativeNames(
                  "Gmina",
                  e.target.value,
                );
            }}
          >
          </vaadin-combo-box>
          <vaadin-combo-box
            id="commune"
            label="Wybierz gminę"
            clear-button-visible
            item-label-path="name"
            item-value-path="teryt"
            @selected-item-changed=${() => {
              this.regionNode.value = "";
              this.regionNode.items = [];
              this.regionNode.selectedItem = undefined;
            }}
            @change=${async (e) => {
              this.regionNode.items = await this.uldkapi.getAdministrativeNames(
                "Region",
                e.target.value,
              );
            }}
          >
          </vaadin-combo-box>
          <vaadin-combo-box
            id="region"
            label="Wybierz region"
            clear-button-visible
            item-label-path="name"
            item-value-path="teryt"
          >
          </vaadin-combo-box>
          <vaadin-text-field id="parcelNr" label="Podaj numer działki">
          </vaadin-text-field>
          <vaadin-button
            id="searchBtn"
            @click=${async () => {
              const teryt = `${this.regionNode?.value}.${this.parcelInput.value}`;
              const voivodeship =
                this.voivodeshipNode?.selectedItem?.name.split("|")[0];
              const county = this.countyNode?.selectedItem?.name.split("|")[0];
              const commune =
                this.communeNode?.selectedItem?.name.split("|")[0];
              const region = this.regionNode?.selectedItem?.name.split("|")[0];
              const parcelId = this.parcelInput.value.split("|")[0];

            }}
            >Wyświetl działkę</vaadin-button
          >
        `;
      }
      case "byID": {
        return html`
          <vaadin-text-field
            label="Podaj numer działki"
            clear-button-visible
            @value-changed="${this.onValueChanged}"
          >
          </vaadin-text-field>
          <vaadin-button
            id="searchBtn"
            @click=${async () => {
              const teryt = `${this.inputValue}`;
              const arrayOfParcel = await this.uldkapi.getParcels(
                "Id",
                teryt,
                2,
              );

              if (!arrayOfParcel) {
                return false;
              }

              const voivodeship = arrayOfParcel[0];
              const county = arrayOfParcel[1];
              const commune = arrayOfParcel[2];
              const region = arrayOfParcel[3];
              const parcelId = arrayOfParcel[4].split(".").pop();
            }}
            >Wyświetl działkę</vaadin-button
          >
        `;
      }
    }
  }

  private onValueChanged(e) {
    this.inputValue = e.detail.value;
  }

  get selected() {
    return this._selected;
  }

  requestUpdate(oldValue?: any) {
    return super.requestUpdate(oldValue);
  }
}
