export interface Vehicle {
  id: string;
  type: 'vehicle';
  attributes: {
    bearing: number | null;
    carriages: unknown[];
    current_status: 'INCOMING_AT' | 'STOPPED_AT' | 'IN_TRANSIT_TO';
    current_stop_sequence: number | null;
    direction_id: 0 | 1;
    label: string;
    latitude: number | null;
    longitude: number | null;
    occupancy_status: string | null;
    revenue: 'REVENUE' | 'NON_REVENUE';
    speed: number | null;
    updated_at: string;
  };
  relationships: {
    route: {data: {id: string; type: 'route'} | null};
    stop: {data: {id: string; type: 'stop'} | null};
    trip: {data: {id: string; type: 'trip'} | null};
  };
}

export interface Route {
  id: string;
  type: 'route';
  attributes: {
    color: string;
    description: string;
    direction_destinations: [string, string];
    direction_names: [string, string];
    fare_class: string;
    listed_route: boolean;
    long_name: string;
    short_name: string;
    sort_order: number;
    text_color: string;
    type: number; // 0=Tram, 1=Subway, 2=Rail, 3=Bus, 4=Ferry
  };
}

export interface Trip {
  id: string;
  type: 'trip';
  attributes: {
    bikes_allowed: 0 | 1 | 2;
    block_id: string;
    direction_id: 0 | 1;
    headsign: string;
    name: string;
    revenue: 'REVENUE' | 'NON_REVENUE';
    wheelchair_accessible: 0 | 1 | 2;
  };
}

export interface APIResponse<T> {
  data: T[];
  included?: Array<
    | Route
    | Trip
    | {id: string; type: string; attributes: Record<string, unknown>}
  >;
  links?: {
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
  };
  jsonapi?: {version: string};
}
