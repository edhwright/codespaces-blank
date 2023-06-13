import Wards from "./Wards";
import Choropleth from "./Choropleth";
import { createSignal } from "solid-js";
import { descending } from "d3-array";
import { price_format } from "../../../../../utils/price_format";
import styles from "./index.module.css"
import type { WardYearSummary, SummaryExtents, Borough, GeoBoroughWard } from "../../../../../utils/interfaces";

interface AggregatesProps {
    borough: Borough;
    geo_borough_wards: GeoBoroughWard[];
    borough_ward_year_summaries: WardYearSummary[];
    summary_extents: {
        all_wards: SummaryExtents;
        borough_wards: SummaryExtents;
    }
}

export default function Aggregates(props: AggregatesProps) {
    const [aggregate, set_aggregate] = createSignal<"average" | "median" | "count" | "sum">("average");

    const [selected_ward, set_selected_ward] = createSignal({ ward: "", value: "" });

    const borough_ward_year_summaries_sorted_by_aggregate = () => {
        return props.borough_ward_year_summaries
            .sort((a, b) => descending(a[aggregate()], b[aggregate()]))
            .map((summary) => ({ name: summary.ward_name, value: aggregate() === "average" || aggregate() === "median" || aggregate() === "sum" ? price_format(summary[aggregate()]) : summary[aggregate()].toLocaleString('en-US') }));
    };

    const list_title = () => {
        if (aggregate() === "average") return "Average property price";
        else if (aggregate() === "median") return "Median property price";
        else if (aggregate() === "count") return "Total properties sold";
        else if (aggregate() === "sum") return "Sum of all properties sold";
        else return ""
    };

    return (
        <div class={styles.container}>
            <div>
                <div class={styles.buttons}>
                    <button class={`${styles.buttons__button} ${aggregate() === "average" && styles.buttons__selected}`} onClick={() => set_aggregate("average")}>
                        Average
                    </button>
                    <button class={`${styles.buttons__button} ${aggregate() === "median" && styles.buttons__selected}`} onClick={() => set_aggregate("median")}>
                        Median
                    </button>
                    <button class={`${styles.buttons__button} ${aggregate() === "sum" && styles.buttons__selected}`} onClick={() => set_aggregate("sum")}>
                        Sum
                    </button>
                    <button class={`${styles.buttons__button} ${aggregate() === "count" && styles.buttons__selected}`} onClick={() => set_aggregate("count")}>
                        Total transactions
                    </button>
                </div>
                <Wards title={list_title()} list={borough_ward_year_summaries_sorted_by_aggregate()} items_per_page={8} set_selected_ward={set_selected_ward} />
            </div>
            <div class={styles.map}>
                <Choropleth
                    borough={props.borough}
                    geo_borough_wards={props.geo_borough_wards}
                    borough_ward_year_summaries={props.borough_ward_year_summaries}
                    summary_extents={props.summary_extents}
                    aggregate={aggregate()}
                    selected_ward={selected_ward()}
                    set_selected_ward={set_selected_ward}
                />
            </div>
        </div>
    );
}
