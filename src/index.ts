import L, { LeafletMouseEvent } from "leaflet";
import { customElement, state } from "lit/decorators";
import "./uldk-panel";
import { html, LitElement } from "lit";

@customElement("main-panel")
export class MainPanel extends LitElement {
  @state() map?: L.Map;

  @state() basemap: L.TileLayer = new L.TileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "OpenStreetMap",
    },
  );

  initMap() {
    this.map = new L.Map("map", {
      center: new L.LatLng(51.236525, 22.4998601),
      zoom: 18,
    });
  }

  firstUpdated(props: any) {
    super.firstUpdated(props);
    this.initMap();
    this.basemap.addTo(this.map!);
  }

  // new L.Map("map", {
  //   center: new L.LatLng(51.236525, 22.4998601),
  //   zoom: 18,
  // });
  // basemap.addTo(map);

  render() {
    return html` <uldk-panel .map=${this.map}></uldk-panel>`;
  }
}

// const uldkPanel = L.Control.extend({
//   container: HTMLDivElement,
//   onAdd: function (map: L.Map) {
//     (this.container as any) = L.DomUtil.create(
//       "div",
//       "uldkPanel"
//     ) as HTMLDivElement;
//     this._update();
//     return this.container;
//   },
//   _update: function (params?: L.LatLng) {
//     if (this.container) {

//       (
//         this.container as any
//       ).innerHTML = `<h4>Panel ULDK</h4> Wyszukiwarka działek
//       <uldk-panel coords=${[params?.lat, params?.lng]}></uldk-panel>`;
//     }
//   },
// });

// let uldkPanel_ = new uldkPanel({ position: "topright" }).addTo(map);

// map.on("click", (e: LeafletMouseEvent) => {
//   uldkPanel_._update(e.latlng);
//   const marker: L.Marker = new L.Marker(e.latlng)
//     .bindPopup(`Współrzędne: ${e.latlng.toString()}`)
//     .addTo(map)
//     .openPopup();
// });
