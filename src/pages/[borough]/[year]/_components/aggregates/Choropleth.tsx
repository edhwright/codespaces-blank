import { createSignal } from "solid-js";
import { scaleQuantize } from "d3-scale";
import { geoPath, geoIdentity } from "d3-geo";
import { price_format } from "../../../../../utils/price_format";
import { format } from "d3-format";
import { schemeOranges } from "d3-scale-chromatic";
import geo_london from "../../../../../geojson/geo-london-region.json";
import styles from "./Choropleth.module.css";
import type { WardYearSummary, SummaryExtents, Borough, GeoBoroughWard } from "../../../../../utils/interfaces";
import type { Setter } from "solid-js";

interface ChoroplethProps {
    borough: Borough;
    geo_borough_wards: GeoBoroughWard[];
    borough_ward_year_summaries: WardYearSummary[];
    summary_extents: {
        all_wards: SummaryExtents;
        borough_wards: SummaryExtents;
    };
    aggregate: "average" | "median" | "count" | "sum";
    selected_ward: { ward: string; value: string };
    set_selected_ward: Setter<{
        ward: string;
        value: string;
    }>;
}

export default function Choropleth(props: ChoroplethProps) {
    const ward_year_summary_by_ward_geocode = new Map(props.borough_ward_year_summaries.map((summary) => [summary.ward_geocode, summary]));

    const [scale_to, set_scale_to] = createSignal("borough");

    const handle_pointer_enter = (ward_geocode: string) => {
        if (ward_year_summary_by_ward_geocode.has(ward_geocode)) {
            if (props.aggregate === "average") props.set_selected_ward({ ward: ward_year_summary_by_ward_geocode.get(ward_geocode)!.ward_name, value: price_format(ward_year_summary_by_ward_geocode.get(ward_geocode)!.average) });
            else if (props.aggregate === "median") props.set_selected_ward({ ward: ward_year_summary_by_ward_geocode.get(ward_geocode)!.ward_name, value: price_format(ward_year_summary_by_ward_geocode.get(ward_geocode)!.median) });
            else if (props.aggregate === "count") props.set_selected_ward({ ward: ward_year_summary_by_ward_geocode.get(ward_geocode)!.ward_name, value: ward_year_summary_by_ward_geocode.get(ward_geocode)!.count.toString() });
            else if (props.aggregate === "sum") props.set_selected_ward({ ward: ward_year_summary_by_ward_geocode.get(ward_geocode)!.ward_name, value: price_format(ward_year_summary_by_ward_geocode.get(ward_geocode)!.sum) });
        } else {
            props.set_selected_ward({ ward: "No data available", value: "" });
        }
    };

    const handle_pointer_leave = () => {
        props.set_selected_ward({ ward: "", value: "" });
    };

    const svg_width = 400;
    const map_height = 458; // height of List with 8 items and heading
    const margin = 32;

    const projection = geoIdentity()
        .reflectY(true)
        .fitExtent(
            [
                [margin, margin],
                [svg_width - margin, map_height - margin],
            ],
            {
                type: "FeatureCollection",
                features: props.geo_borough_wards,
            } as any
        );

    const path_generator = geoPath().projection(projection);

    const quantize_scale_domain = () => (scale_to() === "borough" ? (props.summary_extents.borough_wards[props.aggregate] as [number, number]) : (props.summary_extents.all_wards[props.aggregate] as [number, number]));
    const quantize_scale = () => scaleQuantize<string>().domain(quantize_scale_domain()).range(schemeOranges[9]).nice();

    const ward_fill = (ward_geocode: string) => {
        if (ward_year_summary_by_ward_geocode.get(ward_geocode) === undefined) {
            return "#fff"
        } else {
            return quantize_scale()(ward_year_summary_by_ward_geocode.get(ward_geocode)![props.aggregate]);
        }
    };

    return (
        <>
            <div class={styles.scale}>
                <div class={styles.scale__heading}>Scale choropleth to</div>
                <div class={styles.scale__options}>
                    <div class={styles.scale__option}>
                        <input type="radio" id="borough" name="scale" value="borough" checked onInput={(e) => set_scale_to(e.currentTarget.value)} />
                        <label for="borough" class={styles.scale__option__borough}>
                            {props.borough.borough_name}
                        </label>
                    </div>
                    <div class={styles.scale__option}>
                        <input type="radio" id="london" name="scale" value="london" onInput={(e) => set_scale_to(e.currentTarget.value)} />
                        <label for="london">London</label>
                    </div>
                </div>
            </div>

            <div class={styles.map}>
                <svg preserveAspectRatio="xMinYMin" viewBox={`0 0 ${svg_width} ${map_height}`}>
                    <clipPath id="background_clip">
                        <rect x="0" y="0" width={svg_width} height={map_height} rx="8" />
                    </clipPath>

                    <g>
                        <g clip-path="url(#background_clip)">
                            <path d={path_generator(geo_london.features[0] as any) as string} fill="#f6f6f6" stroke="none" />
                        </g>

                        <g onPointerLeave={() => handle_pointer_leave()}>
                            {props.geo_borough_wards.map((ward) => (
                                <path
                                    onPointerEnter={() => handle_pointer_enter(ward.properties.WD22CD)}
                                    d={path_generator(ward as any) as string}
                                    fill={ward_fill(ward.properties.WD22CD)}
                                    stroke="black"
                                    class={`${ward_year_summary_by_ward_geocode.has(ward.properties.WD22CD) && ward_year_summary_by_ward_geocode.get(ward.properties.WD22CD)!.ward_name === props.selected_ward.ward ? styles.map__selected_path : ""} ${props.selected_ward.ward === "No data available" ? styles.map__selected_path_blank : ""}`}
                                />
                            ))}
                        </g>
                    </g>

                    <g>
                        <text x="16" y={map_height - 16}>
                            {props.selected_ward.ward}
                        </text>
                        <text x={svg_width - 16} y={map_height - 16} text-anchor="end">
                            {props.selected_ward.value}
                        </text>
                    </g>
                </svg>
            </div>
            <div class={styles.legend}>
                <svg preserveAspectRatio="xMinYMin" viewBox={`0 0 ${svg_width} 48`}>
                    {quantize_scale()
                        .range()
                        .map((blue: string, i: number) => (
                            <rect x={i * (svg_width / 9)} y="0" width={(svg_width / 9)} height="10" fill={blue} />
                        ))}
                    {quantize_scale()
                        .thresholds()
                        .map((number: number, i: number) => (
                            <g>
                                <line x1={i * (svg_width / 9) + (svg_width / 9)} y1="0" x2={i * (svg_width / 9) + (svg_width / 9)} y2="15" stroke="black" />
                                <text x={i * (svg_width / 9) + (svg_width / 9)} y="30" text-anchor="middle">
                                    {format(".3s")(number).replaceAll("G", "B")}
                                </text>
                            </g>
                        ))}
                </svg>
            </div>
        </>
    );
}