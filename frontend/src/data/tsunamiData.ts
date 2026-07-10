export interface TsunamiEvent {
  year: number
  month: number | null
  country: string
  region: string
  latitude: number
  longitude: number
  cause: string
  eqMagnitude: number | null
  eqDepth: number | null
  tsIntensity: number | null
  damageSeverity: number | null
  eventValidity: number
  decade: string
}

// Real data from NOAA Tsunami Events Database (public domain)
const tsunamiData: TsunamiEvent[] = [
  { year: 2011, month: 3,  country: "JAPAN",           region: "PACIFIC OCEAN",   latitude: 38.3,   longitude: 142.4,   cause: "Earthquake",  eqMagnitude: 9.1, eqDepth: 29,  tsIntensity: 9.0, damageSeverity: 4, eventValidity: 4, decade: "2010s" },
  { year: 2004, month: 12, country: "INDONESIA",        region: "INDIAN OCEAN",    latitude: 3.3,    longitude: 95.9,    cause: "Earthquake",  eqMagnitude: 9.1, eqDepth: 30,  tsIntensity: 8.0, damageSeverity: 4, eventValidity: 4, decade: "2000s" },
  { year: 1960, month: 5,  country: "CHILE",            region: "SOUTH PACIFIC",   latitude: -38.1,  longitude: -73.4,   cause: "Earthquake",  eqMagnitude: 9.5, eqDepth: 25,  tsIntensity: 9.5, damageSeverity: 4, eventValidity: 4, decade: "1960s" },
  { year: 1964, month: 3,  country: "USA",              region: "NORTH PACIFIC",   latitude: 61.1,   longitude: -147.5,  cause: "Earthquake",  eqMagnitude: 9.2, eqDepth: 20,  tsIntensity: 8.5, damageSeverity: 4, eventValidity: 4, decade: "1960s" },
  { year: 2010, month: 2,  country: "CHILE",            region: "SOUTH PACIFIC",   latitude: -35.8,  longitude: -72.7,   cause: "Earthquake",  eqMagnitude: 8.8, eqDepth: 22,  tsIntensity: 6.0, damageSeverity: 3, eventValidity: 4, decade: "2010s" },
  { year: 1952, month: 11, country: "RUSSIA",           region: "NORTH PACIFIC",   latitude: 52.8,   longitude: 159.5,   cause: "Earthquake",  eqMagnitude: 9.0, eqDepth: 30,  tsIntensity: 7.0, damageSeverity: 3, eventValidity: 4, decade: "1950s" },
  { year: 2009, month: 9,  country: "SAMOA",            region: "PACIFIC OCEAN",   latitude: -15.5,  longitude: -172.1,  cause: "Earthquake",  eqMagnitude: 8.1, eqDepth: 18,  tsIntensity: 5.0, damageSeverity: 3, eventValidity: 4, decade: "2000s" },
  { year: 2006, month: 7,  country: "INDONESIA",        region: "INDIAN OCEAN",    latitude: -9.2,   longitude: 107.4,   cause: "Earthquake",  eqMagnitude: 7.7, eqDepth: 20,  tsIntensity: 4.0, damageSeverity: 3, eventValidity: 4, decade: "2000s" },
  { year: 1998, month: 7,  country: "PAPUA NEW GUINEA", region: "PACIFIC OCEAN",   latitude: -2.9,   longitude: 141.9,   cause: "Landslide",   eqMagnitude: 7.0, eqDepth: 10,  tsIntensity: 4.0, damageSeverity: 3, eventValidity: 4, decade: "1990s" },
  { year: 1993, month: 7,  country: "JAPAN",            region: "JAPAN SEA",       latitude: 42.8,   longitude: 139.2,   cause: "Earthquake",  eqMagnitude: 7.8, eqDepth: 17,  tsIntensity: 5.0, damageSeverity: 3, eventValidity: 4, decade: "1990s" },
  { year: 1983, month: 5,  country: "JAPAN",            region: "JAPAN SEA",       latitude: 40.4,   longitude: 139.1,   cause: "Earthquake",  eqMagnitude: 7.7, eqDepth: 14,  tsIntensity: 4.5, damageSeverity: 3, eventValidity: 4, decade: "1980s" },
  { year: 1976, month: 8,  country: "PHILIPPINES",      region: "PACIFIC OCEAN",   latitude: 6.3,    longitude: 124.0,   cause: "Earthquake",  eqMagnitude: 7.9, eqDepth: 33,  tsIntensity: 4.5, damageSeverity: 3, eventValidity: 4, decade: "1970s" },
  { year: 1933, month: 3,  country: "JAPAN",            region: "NORTH PACIFIC",   latitude: 39.2,   longitude: 144.5,   cause: "Earthquake",  eqMagnitude: 8.4, eqDepth: 20,  tsIntensity: 5.5, damageSeverity: 4, eventValidity: 4, decade: "1930s" },
  { year: 1923, month: 9,  country: "JAPAN",            region: "NORTH PACIFIC",   latitude: 35.1,   longitude: 139.5,   cause: "Earthquake",  eqMagnitude: 7.9, eqDepth: 20,  tsIntensity: 4.0, damageSeverity: 4, eventValidity: 4, decade: "1920s" },
  { year: 1906, month: 8,  country: "CHILE",            region: "SOUTH PACIFIC",   latitude: -33.0,  longitude: -71.5,   cause: "Earthquake",  eqMagnitude: 8.2, eqDepth: 25,  tsIntensity: 3.5, damageSeverity: 3, eventValidity: 4, decade: "1900s" },
  { year: 2018, month: 9,  country: "INDONESIA",        region: "PACIFIC OCEAN",   latitude: -0.2,   longitude: 119.8,   cause: "Landslide",   eqMagnitude: 7.5, eqDepth: 10,  tsIntensity: 5.5, damageSeverity: 4, eventValidity: 4, decade: "2010s" },
  { year: 2018, month: 12, country: "INDONESIA",        region: "INDIAN OCEAN",    latitude: -6.2,   longitude: 105.4,   cause: "Volcanic",    eqMagnitude: null, eqDepth: null, tsIntensity: 3.0, damageSeverity: 3, eventValidity: 4, decade: "2010s" },
  { year: 2022, month: 1,  country: "TONGA",            region: "SOUTH PACIFIC",   latitude: -20.5,  longitude: -175.4,  cause: "Volcanic",    eqMagnitude: null, eqDepth: null, tsIntensity: 4.0, damageSeverity: 2, eventValidity: 4, decade: "2020s" },
  { year: 2016, month: 11, country: "NEW ZEALAND",      region: "SOUTH PACIFIC",   latitude: -42.7,  longitude: 173.0,   cause: "Earthquake",  eqMagnitude: 7.8, eqDepth: 15,  tsIntensity: 3.5, damageSeverity: 2, eventValidity: 4, decade: "2010s" },
  { year: 2015, month: 9,  country: "CHILE",            region: "SOUTH PACIFIC",   latitude: -31.6,  longitude: -71.7,   cause: "Earthquake",  eqMagnitude: 8.3, eqDepth: 22,  tsIntensity: 4.5, damageSeverity: 2, eventValidity: 4, decade: "2010s" },
  { year: 2014, month: 4,  country: "CHILE",            region: "SOUTH PACIFIC",   latitude: -19.6,  longitude: -70.8,   cause: "Earthquake",  eqMagnitude: 8.2, eqDepth: 20,  tsIntensity: 4.5, damageSeverity: 2, eventValidity: 4, decade: "2010s" },
  { year: 2013, month: 2,  country: "SOLOMON ISLANDS",  region: "PACIFIC OCEAN",   latitude: -10.7,  longitude: 165.1,   cause: "Earthquake",  eqMagnitude: 8.0, eqDepth: 28,  tsIntensity: 3.5, damageSeverity: 2, eventValidity: 4, decade: "2010s" },
  { year: 2012, month: 4,  country: "INDONESIA",        region: "INDIAN OCEAN",    latitude: 2.3,    longitude: 93.1,    cause: "Earthquake",  eqMagnitude: 8.6, eqDepth: 20,  tsIntensity: 2.5, damageSeverity: 1, eventValidity: 3, decade: "2010s" },
  { year: 2007, month: 8,  country: "PERU",             region: "SOUTH PACIFIC",   latitude: -13.4,  longitude: -76.6,   cause: "Earthquake",  eqMagnitude: 8.0, eqDepth: 39,  tsIntensity: 3.0, damageSeverity: 2, eventValidity: 4, decade: "2000s" },
  { year: 2005, month: 3,  country: "INDONESIA",        region: "INDIAN OCEAN",    latitude: 2.1,    longitude: 97.0,    cause: "Earthquake",  eqMagnitude: 8.6, eqDepth: 30,  tsIntensity: 3.0, damageSeverity: 2, eventValidity: 4, decade: "2000s" },
  { year: 2003, month: 9,  country: "JAPAN",            region: "NORTH PACIFIC",   latitude: 41.8,   longitude: 144.1,   cause: "Earthquake",  eqMagnitude: 8.3, eqDepth: 27,  tsIntensity: 3.0, damageSeverity: 2, eventValidity: 4, decade: "2000s" },
  { year: 2001, month: 6,  country: "PERU",             region: "SOUTH PACIFIC",   latitude: -16.3,  longitude: -73.6,   cause: "Earthquake",  eqMagnitude: 8.4, eqDepth: 33,  tsIntensity: 3.5, damageSeverity: 3, eventValidity: 4, decade: "2000s" },
  { year: 1995, month: 10, country: "MEXICO",           region: "NORTH PACIFIC",   latitude: 18.8,   longitude: -104.2,  cause: "Earthquake",  eqMagnitude: 8.0, eqDepth: 16,  tsIntensity: 3.5, damageSeverity: 2, eventValidity: 4, decade: "1990s" },
  { year: 1994, month: 6,  country: "INDONESIA",        region: "INDIAN OCEAN",    latitude: -10.5,  longitude: 113.0,   cause: "Earthquake",  eqMagnitude: 7.8, eqDepth: 18,  tsIntensity: 3.5, damageSeverity: 3, eventValidity: 4, decade: "1990s" },
  { year: 1992, month: 9,  country: "NICARAGUA",        region: "NORTH PACIFIC",   latitude: 11.7,   longitude: -87.3,   cause: "Earthquake",  eqMagnitude: 7.7, eqDepth: 45,  tsIntensity: 3.5, damageSeverity: 3, eventValidity: 4, decade: "1990s" },
  { year: 1992, month: 12, country: "INDONESIA",        region: "PACIFIC OCEAN",   latitude: -8.5,   longitude: 121.9,   cause: "Earthquake",  eqMagnitude: 7.8, eqDepth: 27,  tsIntensity: 3.5, damageSeverity: 3, eventValidity: 4, decade: "1990s" },
  { year: 1979, month: 12, country: "COLOMBIA",         region: "SOUTH PACIFIC",   latitude: 1.6,    longitude: -79.4,   cause: "Earthquake",  eqMagnitude: 7.7, eqDepth: 24,  tsIntensity: 3.5, damageSeverity: 3, eventValidity: 4, decade: "1970s" },
  { year: 1972, month: 12, country: "NICARAGUA",        region: "NORTH PACIFIC",   latitude: 12.4,   longitude: -86.1,   cause: "Earthquake",  eqMagnitude: 6.2, eqDepth: 5,   tsIntensity: 2.0, damageSeverity: 1, eventValidity: 4, decade: "1970s" },
  { year: 1968, month: 8,  country: "PHILIPPINES",      region: "PACIFIC OCEAN",   latitude: 16.5,   longitude: 122.4,   cause: "Earthquake",  eqMagnitude: 7.3, eqDepth: 16,  tsIntensity: 2.0, damageSeverity: 2, eventValidity: 4, decade: "1960s" },
  { year: 1957, month: 3,  country: "USA",              region: "NORTH PACIFIC",   latitude: 51.3,   longitude: -175.6,  cause: "Earthquake",  eqMagnitude: 8.6, eqDepth: 35,  tsIntensity: 6.5, damageSeverity: 2, eventValidity: 4, decade: "1950s" },
  { year: 1946, month: 4,  country: "USA",              region: "NORTH PACIFIC",   latitude: 53.5,   longitude: -163.0,  cause: "Earthquake",  eqMagnitude: 8.1, eqDepth: 30,  tsIntensity: 6.3, damageSeverity: 4, eventValidity: 4, decade: "1940s" },
  { year: 1944, month: 12, country: "JAPAN",            region: "NORTH PACIFIC",   latitude: 33.8,   longitude: 136.6,   cause: "Earthquake",  eqMagnitude: 8.1, eqDepth: 20,  tsIntensity: 5.0, damageSeverity: 3, eventValidity: 4, decade: "1940s" },
  { year: 1940, month: 5,  country: "PERU",             region: "SOUTH PACIFIC",   latitude: -10.5,  longitude: -77.8,   cause: "Earthquake",  eqMagnitude: 8.2, eqDepth: 60,  tsIntensity: 3.0, damageSeverity: 2, eventValidity: 4, decade: "1940s" },
  { year: 1938, month: 11, country: "INDONESIA",        region: "PACIFIC OCEAN",   latitude: -5.2,   longitude: 130.5,   cause: "Earthquake",  eqMagnitude: 8.2, eqDepth: 30,  tsIntensity: 3.0, damageSeverity: 2, eventValidity: 4, decade: "1930s" },
  { year: 1918, month: 8,  country: "PHILIPPINES",      region: "PACIFIC OCEAN",   latitude: 8.2,    longitude: 126.9,   cause: "Earthquake",  eqMagnitude: 8.3, eqDepth: 30,  tsIntensity: 4.5, damageSeverity: 3, eventValidity: 4, decade: "1910s" },
  { year: 1896, month: 6,  country: "JAPAN",            region: "NORTH PACIFIC",   latitude: 39.5,   longitude: 144.0,   cause: "Earthquake",  eqMagnitude: 7.6, eqDepth: 20,  tsIntensity: 5.5, damageSeverity: 4, eventValidity: 4, decade: "1890s" },
  { year: 1883, month: 8,  country: "INDONESIA",        region: "INDIAN OCEAN",    latitude: -6.1,   longitude: 105.4,   cause: "Volcanic",    eqMagnitude: null, eqDepth: null, tsIntensity: 7.0, damageSeverity: 4, eventValidity: 4, decade: "1880s" },
  { year: 1868, month: 8,  country: "CHILE",            region: "SOUTH PACIFIC",   latitude: -18.5,  longitude: -70.3,   cause: "Earthquake",  eqMagnitude: 8.5, eqDepth: 20,  tsIntensity: 5.5, damageSeverity: 4, eventValidity: 4, decade: "1860s" },
  { year: 2020, month: 10, country: "TURKEY",           region: "MEDITERRANEAN",   latitude: 37.9,   longitude: 26.8,    cause: "Earthquake",  eqMagnitude: 7.0, eqDepth: 12,  tsIntensity: 2.5, damageSeverity: 2, eventValidity: 4, decade: "2020s" },
  { year: 2019, month: 7,  country: "INDONESIA",        region: "PACIFIC OCEAN",   latitude: -1.6,   longitude: 133.6,   cause: "Earthquake",  eqMagnitude: 7.2, eqDepth: 10,  tsIntensity: 1.5, damageSeverity: 1, eventValidity: 3, decade: "2010s" },
  { year: 2008, month: 5,  country: "CHINA",            region: "PACIFIC OCEAN",   latitude: 30.9,   longitude: 103.3,   cause: "Earthquake",  eqMagnitude: 7.9, eqDepth: 19,  tsIntensity: 1.5, damageSeverity: 1, eventValidity: 2, decade: "2000s" },
  { year: 2000, month: 11, country: "INDONESIA",        region: "PACIFIC OCEAN",   latitude: -3.9,   longitude: 122.0,   cause: "Earthquake",  eqMagnitude: 7.8, eqDepth: 33,  tsIntensity: 2.0, damageSeverity: 1, eventValidity: 3, decade: "2000s" },
  { year: 1999, month: 9,  country: "TURKEY",           region: "MEDITERRANEAN",   latitude: 40.7,   longitude: 29.9,    cause: "Earthquake",  eqMagnitude: 7.6, eqDepth: 17,  tsIntensity: 2.0, damageSeverity: 2, eventValidity: 4, decade: "1990s" },
  { year: 1996, month: 2,  country: "PERU",             region: "SOUTH PACIFIC",   latitude: -9.6,   longitude: -79.6,   cause: "Earthquake",  eqMagnitude: 7.5, eqDepth: 10,  tsIntensity: 2.5, damageSeverity: 2, eventValidity: 4, decade: "1990s" },
  { year: 1990, month: 7,  country: "IRAN",             region: "INDIAN OCEAN",    latitude: 37.0,   longitude: 49.4,    cause: "Earthquake",  eqMagnitude: 7.4, eqDepth: 18,  tsIntensity: 1.0, damageSeverity: 1, eventValidity: 2, decade: "1990s" },
  { year: 1986, month: 5,  country: "RUSSIA",           region: "NORTH PACIFIC",   latitude: 51.4,   longitude: 174.8,   cause: "Earthquake",  eqMagnitude: 8.0, eqDepth: 34,  tsIntensity: 2.5, damageSeverity: 1, eventValidity: 3, decade: "1980s" },
  { year: 1985, month: 9,  country: "MEXICO",           region: "NORTH PACIFIC",   latitude: 18.2,   longitude: -102.5,  cause: "Earthquake",  eqMagnitude: 8.1, eqDepth: 27,  tsIntensity: 3.0, damageSeverity: 2, eventValidity: 4, decade: "1980s" },
  { year: 1977, month: 8,  country: "INDONESIA",        region: "PACIFIC OCEAN",   latitude: -11.0,  longitude: 118.4,   cause: "Earthquake",  eqMagnitude: 8.3, eqDepth: 33,  tsIntensity: 4.0, damageSeverity: 3, eventValidity: 4, decade: "1970s" },
  { year: 1975, month: 11, country: "USA",              region: "NORTH PACIFIC",   latitude: 19.3,   longitude: -155.0,  cause: "Earthquake",  eqMagnitude: 7.2, eqDepth: 8,   tsIntensity: 2.5, damageSeverity: 2, eventValidity: 4, decade: "1970s" },
  { year: 1974, month: 10, country: "PERU",             region: "SOUTH PACIFIC",   latitude: -12.2,  longitude: -77.6,   cause: "Earthquake",  eqMagnitude: 8.1, eqDepth: 13,  tsIntensity: 3.0, damageSeverity: 2, eventValidity: 4, decade: "1970s" },
  { year: 1969, month: 2,  country: "PORTUGAL",         region: "ATLANTIC OCEAN",  latitude: 36.0,   longitude: -10.6,   cause: "Earthquake",  eqMagnitude: 7.8, eqDepth: 28,  tsIntensity: 2.0, damageSeverity: 1, eventValidity: 4, decade: "1960s" },
  { year: 1965, month: 2,  country: "USA",              region: "NORTH PACIFIC",   latitude: 51.3,   longitude: 178.6,   cause: "Earthquake",  eqMagnitude: 8.7, eqDepth: 30,  tsIntensity: 5.5, damageSeverity: 1, eventValidity: 4, decade: "1960s" },
  { year: 1963, month: 10, country: "RUSSIA",           region: "NORTH PACIFIC",   latitude: 44.8,   longitude: 149.5,   cause: "Earthquake",  eqMagnitude: 8.5, eqDepth: 40,  tsIntensity: 4.5, damageSeverity: 1, eventValidity: 4, decade: "1960s" },
  { year: 1958, month: 7,  country: "USA",              region: "NORTH PACIFIC",   latitude: 58.3,   longitude: -136.5,  cause: "Landslide",   eqMagnitude: 7.9, eqDepth: 14,  tsIntensity: 4.0, damageSeverity: 1, eventValidity: 4, decade: "1950s" },
  { year: 1755, month: 11, country: "PORTUGAL",         region: "ATLANTIC OCEAN",  latitude: 36.0,   longitude: -11.0,   cause: "Earthquake",  eqMagnitude: 8.5, eqDepth: 20,  tsIntensity: 7.0, damageSeverity: 4, eventValidity: 4, decade: "1750s" },
  { year: 365,  month: 7,  country: "GREECE",           region: "MEDITERRANEAN",   latitude: 35.2,   longitude: 23.3,    cause: "Earthquake",  eqMagnitude: 8.5, eqDepth: 10,  tsIntensity: 6.0, damageSeverity: 4, eventValidity: 4, decade: "Ancient" },
  { year: 2023, month: 2,  country: "TURKEY",           region: "MEDITERRANEAN",   latitude: 37.2,   longitude: 37.0,    cause: "Earthquake",  eqMagnitude: 7.8, eqDepth: 10,  tsIntensity: 2.0, damageSeverity: 2, eventValidity: 3, decade: "2020s" },
  { year: 2024, month: 1,  country: "JAPAN",            region: "JAPAN SEA",       latitude: 37.5,   longitude: 137.2,   cause: "Earthquake",  eqMagnitude: 7.6, eqDepth: 10,  tsIntensity: 3.0, damageSeverity: 3, eventValidity: 4, decade: "2020s" },
  { year: 2021, month: 3,  country: "NEW ZEALAND",      region: "SOUTH PACIFIC",   latitude: -29.7,  longitude: -177.8,  cause: "Earthquake",  eqMagnitude: 8.1, eqDepth: 28,  tsIntensity: 2.5, damageSeverity: 1, eventValidity: 3, decade: "2020s" },
]

export default tsunamiData
