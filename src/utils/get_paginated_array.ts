export function get_paginated_array(a: any[], elements_per_page: number) {
    let paginated_array = [];
    for (let i = 0; i < a.length; i += elements_per_page) {
        paginated_array.push([...a].slice(i, i + elements_per_page));
    }

    return paginated_array;
}