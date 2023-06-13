import supabase from './supabase';
import type { BoroughYearSummary } from "./interfaces";

export async function fetch_borough_year_summaries() {
    const { data, error } = await supabase.from('london_borough_year_summaries').select('*');    
    
    if (error) {
        console.log(error.message);
    }

    return data as BoroughYearSummary[];
}
