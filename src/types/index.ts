export interface Vehicle {
  id: string;
  attributes: {
    label: string;
    current_status: string;
    latitude: number;
    longitude: number;
    updated_at: string;
  };
  relationships: {
    route: { data: { id: string } | null };
    trip: { data: { id: string } | null };
  };
}

export interface Route {
  id: string;
  attributes: {
    long_name: string;
    short_name: string;
    color: string;
  };
}

export interface Trip {
  id: string;
  attributes: {
    headsign: string;
    name: string;
  };
}

export interface APIResponse<T> {
  data: T[];
  links?: {
    next?: string;
  };
}
