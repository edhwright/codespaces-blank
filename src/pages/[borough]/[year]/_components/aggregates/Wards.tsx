import { get_paginated_array } from "../../../../../utils/get_paginated_array";
import styles from "./Wards.module.css";
import { createSignal, For, Show } from "solid-js";
import type { Setter } from "solid-js";

interface WardsProps {
    title: string;
    list: { name: string; value: string }[];
    items_per_page: number;
    set_selected_ward: Setter<{
        ward: string;
        value: string;
    }>;
}

export default function Wards(props: WardsProps) {
    const [page_number, set_page_number] = createSignal(0);
    const paginated_list: () => { name: string; value: string }[][] = () => get_paginated_array(props.list, props.items_per_page);

    const handle_pointer_enter = (ward: string, value: string) => {
        props.set_selected_ward({ ward: ward, value: value });
    };

    const handle_pointer_leave = () => {
        props.set_selected_ward({ ward: "", value: "" });
    };

    return (
        <section>
            <h3 class={styles.title}>{props.title}</h3>
            <ol class={styles.list} onPointerLeave={() => handle_pointer_leave()}>
                <For each={paginated_list()[page_number()]}>
                    {(item) => (
                        <li class={styles.item} onPointerEnter={() => handle_pointer_enter(item.name, item.value)}>
                            <span>{item.name}</span>
                            <span class={styles.number}>{item.value}</span>
                        </li>
                    )}
                </For>
            </ol>

            <Show when={paginated_list().length > 1}>
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
                        <span class={styles.number}>{page_number() + 1}</span> of <span class={styles.number}>{paginated_list().length}</span>
                    </div>
                    <button class={styles.buttons__button} onClick={() => set_page_number(page_number() + 1)} disabled={page_number() === paginated_list().length - 1}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" width="28" height="28" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <line x1="13" y1="18" x2="19" y2="12"></line>
                            <line x1="13" y1="6" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </Show>
        </section>
    );
}
