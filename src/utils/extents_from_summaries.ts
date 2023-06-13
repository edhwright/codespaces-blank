import { extent } from "d3-array";
import type { Summary, SummaryExtents } from "./interfaces"

export function extents_from_summaries(summaries: Summary[]): SummaryExtents {
    return {
        average: extent(summaries.map((ward_year_summary) => ward_year_summary.average)) as [number, number],
        median: extent(summaries.map((ward_year_summary) => ward_year_summary.median)) as [number, number],
        count: extent(summaries.map((ward_year_summary) => ward_year_summary.count)) as [number, number],
        sum: extent(summaries.map((ward_year_summary) => ward_year_summary.sum)) as [number, number],
    }
}

