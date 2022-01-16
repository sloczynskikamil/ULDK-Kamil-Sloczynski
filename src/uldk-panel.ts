import "@vaadin/vaadin-button";
import "@vaadin/vaadin-combo-box";
import "@vaadin/vaadin-text-field";
import L from "leaflet";
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { UldkApi } from "./uldk-api";

interface uldkItem {
  name: string;
  teryt: string;
}

@customElement("uldk-panel")
export class UldkPanel extends LitElement {
  constructor() {
    super();
  }

  static styles = css`
    :host {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 10px;
      background-color: white;
      width: 270px;
      min-height: 300px;
      overflow: auto;
    }

    vaadin-combo-box {
      width: 100%;
    }

    vaadin-text-field {
      width: 100%;
    }
  `;

  @property({ type: Object }) map?: L.Map;

  @state() geojsonLayer: any = undefined;

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

  private uldkapi: UldkApi = new UldkApi();

  async showPopup(
    type: string,
    teryt: string = "",
    voivodeship: string = "",
    county: string = "",
    commune: string = "",
    region: string = "",
    parcelId: string = "",
  ) {
    if (!this.geojsonLayer) {
      this.geojsonLayer = L.geoJSON(undefined, {
        onEachFeature: function (feature, layer) {
          console.log(feature);

          layer.bindPopup(
            `<h3>DATA:</h3>
            <p><b>Teryt: </b>${feature.properties.teryt}</p>
            <p><b>Województwo: </b>${feature.properties.voivodeship}</p>
            <p><b>Powiat: </b>${feature.properties.county}</p>
            <p><b>Gmina: </b>${feature.properties.commune}</p>
            <p><b>Region: </b>${feature.properties.region}</p>
            <p><b>Nr działki: </b>${feature.properties.parcelId}</p>`,
          );
        },
      }).addTo(this.map!);
    }

    this.geojsonLayer.clearLayers();

    const wktJSON = await this.uldkapi.getParcel(type, teryt);
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

    this.geojsonLayer.addData(dataJSON);
    this.map?.fitBounds(this.geojsonLayer.getBounds());

    return "";
  }

  render() {
    return html`
      <h4 style="color:red; font-family: Arial, Helvetica, sans-serif;">Sprawdzanie parametrów działek</h4>
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
          let data = await this.uldkapi.getAdministrativeNames("Wojewodztwo");
          callback(data, data.length);
        }}
        @change=${async (e) => {
          this.countyNode.items = await this.uldkapi.getAdministrativeNames(
            "Powiat",
            e.target.value,
          );
        }}
      ></vaadin-combo-box>
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
          this.communeNode.items = await this.uldkapi.getAdministrativeNames(
            "Gmina",
            e.target.value,
          );
        }}
      ></vaadin-combo-box>
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
      ></vaadin-combo-box>
      <vaadin-combo-box
        id="region"
        label="Wybierz region"
        clear-button-visible
        item-label-path="name"
        item-value-path="teryt"
      ></vaadin-combo-box>
      <vaadin-text-field
        id="parcelNr"
        label="Podaj nr działki"
      ></vaadin-text-field>
      <vaadin-button
        id="searchBtn"
        @click=${async () => {
          const teryt = `${this.regionNode?.value}.${this.parcelInput.value}`;
          const voivodeship =
            this.voivodeshipNode?.selectedItem?.name.split("|")[0];
          const county = this.countyNode?.selectedItem?.name.split("|")[0];
          const commune = this.communeNode?.selectedItem?.name.split("|")[0];
          const region = this.regionNode?.selectedItem?.name.split("|")[0];
          const parcelId = this.parcelInput.value.split("|")[0];

          console.log(
            await this.showPopup(
              "Dzialka",
              teryt,
              voivodeship,
              county,
              commune,
              region,
              parcelId,
            ),
          );
        }}
        >Szukaj w ULDK</vaadin-button
      >
    `;
  }
}

// request o kliknięcie na mapie
//https://uldk.gugik.gov.pl/?request=GetParcelByXY&result=teryt,region,voivodeship,geom_wkt&xy=23.0890058083815,52.0452642329098,4326
