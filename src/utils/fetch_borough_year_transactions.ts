import supabase from "./supabase";
import type { Transaction } from "./interfaces";

export async function fetch_borough_year_transactions(borough_geocode: string, year: string) {    
	const { data, error } = await supabase.from("london_transactions").select('*').eq("borough_geocode", borough_geocode).like('date_of_transfer', `${year}%`); 

	if (error) {
		console.log(error.message);
	}

	return data as Transaction[];
}
