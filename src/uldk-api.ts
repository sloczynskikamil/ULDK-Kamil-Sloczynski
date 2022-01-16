import "@vaadin/vaadin-button";
import "@vaadin/vaadin-combo-box";
import "@vaadin/vaadin-text-field";
import L from "leaflet";
import { customElement, property, state } from "lit/decorators.js";
import wellknown from "wellknown/wellknown.js";

import { LitElement, css } from "lit-element";

export interface uldkItem {
  name: string;
  teryt: string;
}

@customElement("my-button")
export class UldkApi extends LitElement {
  constructor() {
    super();
  }

  static styles = css`
    :host {
      display: inline-block;
      padding: 10px;
      background: #5fe1ee;
      border-radius: 5px;
      cursor: pointer;
    }
  `;

  @state() search_types_by_option = {
    Wojewodztwo: {
      param: "GetVoivodeshipById",
      name: "voivodeship",
    },
    Powiat: {
      param: "GetCountyById",
      name: "county",
    },
    Gmina: {
      param: "GetCommuneById",
      name: "commune",
    },
    Region: {
      param: "GetRegionById",
      name: "region",
    },
    Dzialka: {
      param: "GetParcelById",
      name: "geom_wkt",
    },
  };

  @property({ type: Object }) map?: L.Map;

  wktToGeoJSON(wkt: string): GeoJSON.GeometryObject {
    return wellknown.parse(wkt);
  }

  async getAdministrativeNames(type: string, teryt: string = "") {
    const url = `https://uldk.gugik.gov.pl/?request=${this.search_types_by_option[type].param}&result=${this.search_types_by_option[type].name},teryt&id=${teryt}`;
    const text = await fetch(url).then((r) => r.text());
    const result = text.substring(1).trim();
    const arr = result.split("\n");
    let items: uldkItem[] = [];

    arr.forEach((item) => {
      const itemSplit = item.split("|");
      items.push({ name: itemSplit.join(" | "), teryt: itemSplit[1] });
    });

    return items;
  }

  async getParcel(type: string, teryt: string = "") {
    const url = `https://uldk.gugik.gov.pl/?request=${this.search_types_by_option[type].param}&result=${this.search_types_by_option[type].name}&srid=4326&id=${teryt}`;
    const text = await fetch(url).then((r) => r.text());
    const result = text.substring(1).trim();
    const wkt = (result.includes(";") ? result.split(";")[1] : result)
      ?.trim()
      .split("\n")[0];

    const wktJSON = this.wktToGeoJSON(wkt);

    return wktJSON;
  }
}
