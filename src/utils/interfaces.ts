export interface Transaction {
	transaction_id: string;
	price: number;
	date_of_transfer: string;
	property_type: string;
	old_new: string;
	duration: string;
	paon: string;
	saon: string;
	street: string;
	locality: string;
	postcode: string;
	postcode_lat: number;
	postcode_long: number;
	ward_name: string;
	ward_geocode: string;
	borough_name: string;
	borough_geocode: string;
}

export interface BoroughYearSummary {
	id: number;
	borough_name: string;
	borough_geocode: string;
	year: string;
	average: number;
	median: number;
	sum: number;
	count: number;
}

export interface WardYearSummary {
	id: number;
	ward_name: string;
	ward_geocode: string;
	year: string;
    borough_name: string;
	borough_geocode: string;
	average: number;
	median: number;
	sum: number;
	count: number;
}

export interface GeoBoroughWard {
	type: string;
	geometry: {
		type: string;
		coordinates: number[][][];
	};
	properties: {
		OBJECTID: number;
		WD22CD: string;
		WD22NM: string;
		WD22NMW: string;
		LAD22CD: string;
		LAD22NM: string;
		BNG_E: number;
		BNG_N: number;
		LONG: number;
		LAT: number;
		GlobalID: string;
		Shape__Are: number;
		Shape__Len: number;
	};
}

export interface Summary {
	average: number;
	median: number;
	count: number;
	sum: number;
}

export interface SummaryExtents {
	average: [number, number];
	median: [number, number];
	count: [number, number];
	sum: [number, number];
}

export interface Borough {
	borough_name: string;
	borough_slug: string;
	borough_geocode: string;
	borough_colour: string;
}
