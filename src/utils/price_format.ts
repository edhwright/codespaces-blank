import { formatLocale } from "d3-format";

const UK = formatLocale({
    "decimal": ".",
    "thousands": ",",
    "grouping": [3],
    "currency": ["£", ""],
});

export const price_format = (price: number): string => {
    const f = UK.format("$,.0f");
    return f(price);
} 