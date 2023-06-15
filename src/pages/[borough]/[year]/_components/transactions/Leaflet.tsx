import { onMount } from "solid-js";
import { createResource, Show } from "solid-js";
import 'leaflet/dist/leaflet.css';

interface LeafletProps {
    lat: number;
    long: number;
}

// https://github.com/Leaflet/Leaflet/issues/6331

export default function Leaflet(props: LeafletProps) {
    const [L] = createResource(async () => {
        const L = await import("leaflet");
        return L;
    });

    return (
        <Show when={!L.loading}>
            <Map l={L()} lat={props.lat} long={props.long} />
        </Show>
    );
}

interface MapProps {
    l: any;
    lat: number;
    long: number;
}

function Map(props: MapProps) {
    let div: HTMLDivElement | undefined = undefined;
    onMount(() => {
        const map = props.l.map(div).setView([props.lat, props.long], 15);
        props.l
            .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            })
            .addTo(map);

        const defaultIcon = props.l.icon({
            iconUrl: '/marker-icon-2x.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });
        props.l.marker([props.lat, props.long], { icon: defaultIcon }).addTo(map);
    });

    return <div ref={div} style="height: 400px; width: 100%; border-radius: 8px;" />;
}