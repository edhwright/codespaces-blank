import london_boroughs from "../geojson/london-boroughs.json";

export const borough_by_geocode = new Map(london_boroughs.map((borough) => [borough.borough_geocode, borough]));
