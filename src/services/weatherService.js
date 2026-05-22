const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY;
const WAPI_KEY = import.meta.env.VITE_WAPI_KEY;

// Map code to general condition
export const mapOWMCondition = (code) => {
  if (code >= 200 && code < 300) return 'stormy';
  if (code >= 300 && code < 600) return 'rainy';
  if (code >= 600 && code < 700) return 'snowy';
  if (code >= 700 && code < 800) return 'cloudy';
  if (code === 800) return 'clear';
  return 'cloudy';
};

export const mapWAPICondition = (code) => {
  if (code === 1000) return 'clear';
  if ([1003, 1006, 1009].includes(code)) return 'cloudy';
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243].includes(code)) return 'rainy';
  if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255].includes(code)) return 'snowy';
  if ([1087, 1273, 1276].includes(code)) return 'stormy';
  return 'cloudy';
};

// Fetch City Suggestions (Autocomplete)
export const fetchCitySuggestions = async (query) => {
  if (!query || query.length < 3) return [];
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${OWM_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(item => ({
      name: item.name,
      state: item.state,
      country: item.country,
      lat: item.lat,
      lon: item.lon
    }));
  } catch (err) {
    console.error("Autocomplete error:", err);
    return [];
  }
};

// Fetch OpenWeatherMap
export const fetchFromOWM = async (searchQuery, isCoords) => {
  let currentUrl = '';
  let forecastUrl = '';
  if (isCoords) {
    const [lat, lon] = searchQuery.split(',');
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
  } else {
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&appid=${OWM_API_KEY}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchQuery}&appid=${OWM_API_KEY}&units=metric`;
  }

  const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error(currentRes.status === 404 ? 'City not found' : 'OWM API Error');
  }

  const current = await currentRes.json();
  const forecast = await forecastRes.json();
  
  // Normalize Data
  const isDay = current.weather[0].icon.includes('d');
  
  // Process Forecast
  const dailyData = {};
  forecast.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = { minC: item.main.temp_min, maxC: item.main.temp_max, desc: item.weather[0].description, iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`, dt: item.dt };
    } else {
      if (item.main.temp_min < dailyData[date].minC) dailyData[date].minC = item.main.temp_min;
      if (item.main.temp_max > dailyData[date].maxC) dailyData[date].maxC = item.main.temp_max;
      if (item.dt_txt.includes('12:00:00')) {
        dailyData[date].iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        dailyData[date].desc = item.weather[0].description;
      }
    }
  });

  const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  
  return {
    location: {
      name: current.name,
      country: current.sys.country,
      localTimeFormatted: new Date(current.dt * 1000).toLocaleString('en-US', options)
    },
    current: {
      tempC: current.main.temp,
      feelsLikeC: current.main.feels_like,
      humidity: current.main.humidity,
      windKph: current.wind.speed * 3.6,
      desc: current.weather[0].description,
      iconUrl: `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`,
      isDay: isDay,
      conditionType: mapOWMCondition(current.weather[0].id),
      visibility: current.visibility / 1000, // km
      sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      uvIndex: 'N/A' // OWM requires separate call for UV
    },
    forecast: Object.values(dailyData).slice(0, 5).map((d, i) => ({
      dateFormatted: i === 0 ? 'Today' : new Date(d.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
      minC: d.minC,
      maxC: d.maxC,
      desc: d.desc,
      iconUrl: d.iconUrl
    })),
    hourly: forecast.list.slice(0, 24).map(h => ({
      hourFormatted: new Date(h.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      tempC: h.main.temp,
      iconUrl: `https://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png`
    }))
  };
};

// Fetch WeatherAPI (Fallback)
export const fetchFromWAPI = async (searchQuery, isCoords) => {
  const q = searchQuery;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WAPI_KEY}&q=${q}&days=5&aqi=yes&alerts=yes`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(res.status === 400 || res.status === 404 ? 'City not found' : 'WAPI API Error');
  }
  
  const data = await res.json();
  
  const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };

  return {
    location: {
      name: data.location.name,
      country: data.location.country,
      localTimeFormatted: new Date(data.location.localtime).toLocaleString('en-US', options)
    },
    current: {
      tempC: data.current.temp_c,
      feelsLikeC: data.current.feelslike_c,
      humidity: data.current.humidity,
      windKph: data.current.wind_kph,
      desc: data.current.condition.text,
      iconUrl: data.current.condition.icon,
      isDay: data.current.is_day === 1,
      conditionType: mapWAPICondition(data.current.condition.code),
      visibility: data.current.vis_km,
      sunrise: data.forecast.forecastday[0].astro.sunrise,
      sunset: data.forecast.forecastday[0].astro.sunset,
      uvIndex: data.current.uv,
      aqi: Math.round(data.current.air_quality['us-epa-index'])
    },
    alerts: data.alerts?.alert?.map(alert => ({
      headline: alert.headline,
      desc: alert.desc,
      severity: alert.severity,
      urgency: alert.urgency,
      areas: alert.areas
    })) || [],
    forecast: data.forecast.forecastday.map((d, i) => ({
      dateFormatted: i === 0 ? 'Today' : new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' }),
      minC: d.day.mintemp_c,
      maxC: d.day.maxtemp_c,
      desc: d.day.condition.text,
      iconUrl: d.day.condition.icon
    })),
    hourly: data.forecast.forecastday[0].hour
      .map(h => ({
        hourFormatted: new Date(h.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        tempC: h.temp_c,
        iconUrl: h.condition.icon
      }))
  };
};
