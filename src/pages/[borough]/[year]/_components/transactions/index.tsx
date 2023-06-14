import { createSignal, For, Show, Switch, Match } from "solid-js";
import { price_format } from "../../../../../utils/price_format";
import { group, ascending, descending } from "d3-array";
import { get_paginated_array } from "../../../../../utils/get_paginated_array";
import styles from "./index.module.css";
import Leaflet from "./Leaflet";
import type { WardYearSummary, Borough, Transaction } from "../../../../../utils/interfaces";

interface TransactionsProps {
    borough: Borough;
    borough_transactions: Transaction[];
    borough_ward_year_summaries: WardYearSummary[];
}

export default function Transactions(props: TransactionsProps) {
    const [selected_ward, set_selected_ward] = createSignal("All");
    const transactions_by_ward_name = group(props.borough_transactions, (t: Transaction) => t.ward_name);

    const [sort_by, set_sort_by] = createSignal("Property");
    const [sort_direction, set_sort_direction] = createSignal("asc");

    const selected_transactions = () => (selected_ward() === "All" ? props.borough_transactions : transactions_by_ward_name.get(selected_ward()));

    const [search_query, set_search_query] = createSignal("");
    const filtered_transactions = () => selected_transactions()!.filter(transaction => Object.values(transaction).toString().toLowerCase().replaceAll(" ", "").replaceAll(",", "").includes(search_query().toLowerCase().replaceAll(" ", "").replaceAll(",", "")));

    const sorted_transactions = () =>
        filtered_transactions().sort((a, b) => {
            if (sort_by() === "Property") {
                if (sort_direction() === "asc") {
                    return ascending(a.street, b.street);
                } else {
                    return descending(a.street, b.street);
                }
            } else {
                if (sort_direction() === "asc") {
                    return a.price - b.price;
                } else {
                    return b.price - a.price;
                }
            }
        });

    const paginated_table: () => Transaction[][] = () => get_paginated_array(sorted_transactions(), 20);
    const [page_number, set_page_number] = createSignal(0);

    const handle_header_click = (header: "Property" | "Price") => {
        if (sort_by() === header) {
            set_sort_direction(sort_direction() === "asc" ? "dsc" : "asc");
        } else {
            set_sort_direction("asc");
        }

        set_sort_by(header);
    };

    const borough_wards = props.borough_ward_year_summaries.map((ward_year_summary) => ward_year_summary.ward_name).sort();

    return (
        <div class={styles.container}>
            <div class={styles.filters}>

                <input onInput={(e) => {
                    set_search_query(e.currentTarget.value);
                    set_page_number(0);
                }}
                    placeholder="Search"
                />

                <select class={styles.select} onChange={(e) => set_selected_ward(e.currentTarget.value)}>
                    <option>All</option>
                    {borough_wards.map((ward) => (
                        <option value={ward}>{ward}</option>
                    ))}
                </select>
            </div>

            <table class={styles.table}>
                <thead>
                    <tr class={styles.table__header__row}>
                        <th class={styles.table__header__property} onclick={() => handle_header_click("Property")}>
                            <span class={styles.table__header__property__text}>Property</span>
                            <Show when={sort_by() === "Property"}>
                                <span class={styles.table__header__property__arrow}>
                                    <Switch>
                                        <Match when={sort_direction() === "asc"}>
                                            <UpArrow />
                                        </Match>
                                        <Match when={sort_direction() === "dsc"}>
                                            <DownArrow />
                                        </Match>
                                    </Switch>
                                </span>
                            </Show>
                        </th>
                        <th class={styles.table__header__price} onclick={() => handle_header_click("Price")}>
                            <Show when={sort_by() === "Price"}>
                                <span class={styles.table__header__price__arrow}>
                                    <Switch>
                                        <Match when={sort_direction() === "asc"}>
                                            <UpArrow />
                                        </Match>
                                        <Match when={sort_direction() === "dsc"}>
                                            <DownArrow />
                                        </Match>
                                    </Switch>
                                </span>
                            </Show>
                            <span class={styles.table__header__price__text}>Price</span>
                        </th>
                    </tr>
                </thead>
                <tbody class={styles.transaction}>
                    <For each={paginated_table()[page_number()]}>{(transaction) => <Row transaction={transaction} />}</For>
                </tbody>
            </table>

            <Show when={paginated_table().length > 1}>
                <div class={styles.buttons}>
                    <button class={styles.buttons__button} onClick={() => set_page_number(page_number() - 1)} disabled={page_number() === 0}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-left" width="28" height="28" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <line x1="5" y1="12" x2="11" y2="18"></line>
                            <line x1="5" y1="12" x2="11" y2="6"></line>
                        </svg>
                    </button>
                    <div class={styles.buttons__state}>
                        <span class={styles.number}>{page_number() + 1}</span> of <span class={styles.number}>{paginated_table().length}</span>
                    </div>
                    <button class={styles.buttons__button} onClick={() => set_page_number(page_number() + 1)} disabled={page_number() === paginated_table().length - 1}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" width="28" height="28" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <line x1="13" y1="18" x2="19" y2="12"></line>
                            <line x1="13" y1="6" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </Show>
        </div>
    );
}

interface RowProps {
    transaction: Transaction;
}

function Row(props: RowProps) {
    const [show_map, set_show_map] = createSignal(false);
    return (
        <>
            <tr class={styles.row} onClick={() => set_show_map(!show_map())}>
                <td class={`${styles.row__address} ${show_map() ? styles.remove_bottom_border : ""}`}>{address_string(props.transaction) && <p>{address_string(props.transaction)}</p>}</td>
                <td class={`${styles.row__price} ${show_map() ? styles.remove_bottom_border : ""}`}>{price_format(props.transaction.price)}</td>
            </tr>
            <Show when={show_map()}>
                <tr class={styles.row__expanded}>
                    <td colspan="2" class={styles.row__expanded__cell}>
                        <div class={styles.row__expanded__cell__address}>
                            <p class={styles.row__expanded__cell__address__header}>Address</p>
                            <p class={styles.row__expanded__cell__address__body}>
                                {props.transaction.paon && <>{props.transaction.paon}<br /></>}
                                {props.transaction.saon && <>{props.transaction.saon}<br /></>}
                                {props.transaction.street && <>{props.transaction.street}<br /></>}
                                {props.transaction.locality && <>{props.transaction.locality}<br /></>}
                                {props.transaction.postcode && <>{props.transaction.postcode}<br /></>}
                            </p>
                        </div>
                        <div class={styles.row__expanded__cell__details}>
                            <p class={styles.row__expanded__cell__details__header}>Details</p>
                            <ul class={styles.row__expanded__cell__details__body}>
                                {property_type_string(props.transaction.property_type) && <li>{property_type_string(props.transaction.property_type)}</li>}
                                {old_new_string(props.transaction.old_new) && <li>{old_new_string(props.transaction.old_new)}</li>}
                                {duration_string(props.transaction.duration) && <li>{duration_string(props.transaction.duration)}</li>}
                            </ul>
                        </div>
                        <div class={styles.row__expanded__cell__date}>
                            <p class={styles.row__expanded__cell__date__header}>Date of transfer</p>
                            <p class={styles.row__expanded__cell__date__body}>{new Date(props.transaction.date_of_transfer).toLocaleDateString('en-us', { year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                        <div class={styles.row__expanded__cell__map}>
                            <Leaflet lat={props.transaction.postcode_lat} long={props.transaction.postcode_long} />
                        </div>
                    </td>
                </tr>
            </Show>
        </>
    );
}

function UpArrow() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-big-up-filled" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M10.586 3l-6.586 6.586a2 2 0 0 0 -.434 2.18l.068 .145a2 2 0 0 0 1.78 1.089h2.586v7a2 2 0 0 0 2 2h4l.15 -.005a2 2 0 0 0 1.85 -1.995l-.001 -7h2.587a2 2 0 0 0 1.414 -3.414l-6.586 -6.586a2 2 0 0 0 -2.828 0z" stroke-width="0" fill="currentColor"></path>
        </svg>
    );
}

function DownArrow() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-big-down-filled" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M10 2l-.15 .005a2 2 0 0 0 -1.85 1.995v6.999l-2.586 .001a2 2 0 0 0 -1.414 3.414l6.586 6.586a2 2 0 0 0 2.828 0l6.586 -6.586a2 2 0 0 0 .434 -2.18l-.068 -.145a2 2 0 0 0 -1.78 -1.089l-2.586 -.001v-6.999a2 2 0 0 0 -2 -2h-4z" stroke-width="0" fill="currentColor"></path>
        </svg>
    );
}

function address_string(transaction: Transaction) {
    return `${transaction.paon ? `${transaction.paon}, ` : ""}${transaction.saon ? `${transaction.saon}, ` : ""}${transaction.street ? `${transaction.street}, ` : ""}${transaction.locality ? `${transaction.locality}, ` : ""}${transaction.postcode ? transaction.postcode : ""}`;
}

function property_type_string(property_type: string) {
    if (property_type === "D") {
        return "Detached";
    } else if (property_type === "S") {
        return "Semi-Detached";
    } else if (property_type === "T") {
        return "Terraced";
    } else if (property_type === "F") {
        return "Flat/Maisonette";
    } else {
        return "";
    }
}

function old_new_string(old_new: string) {
    if (old_new === "N") {
        return "Established residential building";
    } else if (old_new === "Y") {
        return "Newly built property";
    } else return "";
}

function duration_string(duration: string) {
    if (duration === "F") {
        return "Freehold";
    } else if (duration === "L") {
        return "Leasehold";
    } else {
        return "";
    }
}