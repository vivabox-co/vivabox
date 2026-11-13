import L from "leaflet"
import { getActivityIcon } from "./config"

// Same 44px teardrop pin as the beneficiary app (lib/map/createPinIcon.ts),
// minus the favourites badge which doesn't exist on the website.
export function createPinIcon(categoryColor: string, activityKey: string, title: string) {
  const iconSrc = getActivityIcon(activityKey)

  return L.divIcon({
    className: "vivabox-pin",
    html: `
      <div style="position: relative; width: 44px; height: 44px;">
        <div role="img" aria-label="${title.replace(/"/g, "&quot;")}" style="
          position: relative;
          width: 44px;
          height: 44px;
          background: ${categoryColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 14px rgba(0,0,0,0.25);
        ">
          <img
            src="${iconSrc}"
            width="22"
            height="22"
            alt=""
            style="
              transform: rotate(45deg);
              position: relative;
              z-index: 2;
              pointer-events: none;
              filter: brightness(0) invert(1);
            "
          />
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40],
  })
}

// Same cluster bubble as the app (MapView.tsx → createClusterIcon).
export function createClusterIcon(color: string) {
  return (cluster: { getChildCount: () => number }) =>
    L.divIcon({
      html: `<div style="
        background:${color};
        width:46px;
        height:46px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:700;
        font-size:14px;
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.25);
      ">${cluster.getChildCount()}</div>`,
      className: "",
      iconSize: [46, 46],
    })
}
