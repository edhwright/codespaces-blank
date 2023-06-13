import { createSignal } from "solid-js";
import { scaleTime, scaleLinear } from "d3-scale";
import { extents_from_summaries } from "../../../utils/extents_from_summaries";
import { price_format } from "../../../utils/price_format";
import styles from "./Chart.module.css";
import type { BoroughYearSummary } from "../../../utils/interfaces";

interface ChartProps {
    summaries: BoroughYearSummary[];
    line_colour: string;
}

export default function Chart(props: ChartProps) {
    const [aggregate, set_aggregate] = createSignal<"average" | "median" | "sum" | "count">("average");

    const extents = extents_from_summaries(props.summaries.map((b) => ({ average: b.average, median: b.median, count: b.count, sum: b.sum })));

    const x = scaleTime()
        .domain([new Date(props.summaries[0].year), new Date(props.summaries[props.summaries.length - 1].year)])
        .range([0, 100]);

    const y = () => scaleLinear().domain([extents[aggregate()][0], extents[aggregate()][1]]).range([100, 0]).nice();

    const points = () => props.summaries.map((summary) => `${x(new Date(summary.year))},${y()(summary[aggregate()])}`).join(" ");

    const chart_title = () => {
        if (aggregate() === "average") return "Average property price over time";
        else if (aggregate() === "median") return "Median property price over time";
        else if (aggregate() === "count") return "Total number of properties sold over time";
        else if (aggregate() === "sum") return "Sum of all properties sold over time";
    };

    const format = (number: number) => aggregate() === "count" ? number.toLocaleString('en-US') : price_format(number)

    return (
        <>
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
            </div>

            <figure class={styles.figure}>
                <figcaption>{chart_title()}</figcaption>
                <div class={styles.chart}>
                    <div class={styles.axis__y}>
                        {y()
                            .ticks(8)
                            .map((tick) => (
                                <span class={styles.axis__y__tick} style={`top: ${y()(tick)}%`}>
                                    {format(tick)}
                                </span>
                            ))}
                    </div>
                    <div class={styles.axis__x}>
                        {x.ticks().map((tick) => (
                            <span class={styles.axis__x__tick} style={`left: ${x(tick)}%`}>
                                {`'${tick.getFullYear().toString().substring(2)}`}
                            </span>
                        ))}
                    </div>
                    <div class={styles.axis__baseline} />
                    <svg class={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline class={styles.line} style={`stroke: ${props.line_colour}`} points={points()}></polyline>
                    </svg>
                </div>
            </figure>
        </>
    );
}
