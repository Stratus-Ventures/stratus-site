

//  D A T A B A S E   T Y P E S  ----------------------------------------------------- //

export interface StratusProduct {
    id?: string;
    source_id?: string;
    name: string;
    tagline: string;
    url: string;
}

export type StratusMetricType = 
    | 'user_created' 
    | 'download_started' 
    | 'subscription_activated'
;

export interface StratusMetric {
    id?: string;
    source_id?: string;
    event_type: StratusMetricType;
    origin_lat: number;
    origin_long: number;
    city_code: string;
    country_code: string;
    product_id?: string;
    created_at?: string;
}