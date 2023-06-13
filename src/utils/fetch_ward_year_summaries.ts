import supabase from './supabase';
import type { WardYearSummary } from "./interfaces";

export async function fetch_ward_year_summaries() {
    const { data, error } = await supabase.from('london_ward_year_summaries').select('*');
    
    if (error) {
        console.log(error.message);
    }

    return data as WardYearSummary[];
}