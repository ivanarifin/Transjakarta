import { APIResponse, Route, Trip, Vehicle } from '../types';

const BASE_URL = 'https://api-v3.mbta.com';

export const fetchVehicles = async (
  pageOffset: number = 0,
  routeIds: string[] = [],
  tripIds: string[] = []
): Promise<APIResponse<Vehicle>> => {
  let url = `${BASE_URL}/vehicles?page[limit]=10&page[offset]=${pageOffset}&include=route,trip`;
  
  if (routeIds.length > 0) {
    url += `&filter[route]=${routeIds.join(',')}`;
  }
  
  if (tripIds.length > 0) {
    url += `&filter[trip]=${tripIds.join(',')}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
};

export const fetchRoutes = async (): Promise<APIResponse<Route>> => {
  const response = await fetch(`${BASE_URL}/routes`);
  if (!response.ok) throw new Error('Failed to fetch routes');
  return response.json();
};

export const fetchTrips = async (): Promise<APIResponse<Trip>> => {
  const response = await fetch(`${BASE_URL}/trips?page[limit]=20`); // Limit for demo
  if (!response.ok) throw new Error('Failed to fetch trips');
  return response.json();
};
