const searchForm = document.querySelector(".search");
const searchInput = document.querySelector("#search");
const current_location = document.querySelector("#Location");
const current_condition = document.querySelector("#condition");
const current_time = document.querySelector("#current_time");
const current_temperature= document.querySelector("#temperature");
const feels = document.querySelector("#feels");
const rain_chance = document.querySelector("#rain");
const wind_speed = document.querySelector("#wind");
const weekdays = document.querySelector("#forecastday");
const timeForcast = document.querySelector("#timeForcast");
const toggle_unit = document.querySelector(".toggle");
const F = document.querySelector('.F');
const C = document.querySelector('.C');
const loader = document.querySelector("#loading");
let loading=true;

const isLoading =(state)=>{
    state==true?loader.style.display="block" : loader.style.display="none";
}

let key = "a13cef89520443c7b64104405232707";
let unit = "C";
let place;
let current_data;

const newLocation = (location)=>{
    localStorage.setItem('location', location);
}

const start = ()=>{
    place = localStorage.getItem('location') || "kigali";
    unit = localStorage.getItem('unit')|| 'C';

    unit=='C'? C.classList.add("active"):F.classList.add("active");
    getData(place);

}

const display=(data)=>{
    current_location.innerHTML = `${data.Location}`;
    current_condition.innerHTML = `${data.condition}`;
    feels.innerHTML = `${data.feelslike} <span><sup>o</sup>${unit}</span>`;
    rain_chance.innerHTML = `${data.chanceofrain}%`;
    wind_speed.innerHTML = `${data.wind}kph`;
    current_temperature.innerHTML = `${data.temperature} <span><sup>o</sup>${unit}</span>`
    let weekdaysData = ""; 
    const days  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; 
    data.forecastday.forEach(item=>{
        const dayNum = new Date(item.date).getDay();
        weekdaysData += `
            <li>
                <h2>${days[dayNum]}</h2>
                <p>${item.temp}<span><sup>o</sup>${unit}</span></P>
                <img src="https:${item.image}">
            </li>
        `
    });
    weekdays.innerHTML = weekdaysData;
    const now = new Date(data.localtime);
    const options = { month: 'long' };
    const currentMonth = now.toLocaleString('en-US', options);
    current_time.innerHTML = `${now.getDate()}-${currentMonth}-${now.getFullYear()}`
    let timeforcast = "";

    for(item in data.forecasthours){
            
        if(item>=now.getHours()){
            timeforcast+=`
                <li>${item}<hr><span class="temp">${data.forecasthours[item]}<sup>o</sup>C</span>
             `;
        }
    };
}

const findData=(data)=>{
    const foundData = {
      Location: data.location.region+", "+data.location.country,
      feelslike: unit == "C"? data.current.feelslike_c : data.current.feelslike_f,
      humidity: data.current.humidity,
      condition: data.current.condition.text,
      wind: data.current.wind_kph,
      temperature: unit == "C"? data.current.temp_c : data.current.temp_f,
      forecastday: data.forecast.forecastday.map(day=>{
        const date= day.date;
        const temp= unit == "C"? day.day.avgtemp_c: day.day.avgtemp_f;
        const image= day.day.condition.icon;
        return {date, temp, image};    
    }),
      forecasthours: data.forecast.forecastday[0].hour.map(item=>item.temp_c),
      chanceofrain: data.forecast.forecastday[0].day.daily_chance_of_rain,
      localtime: data.location.localtime
    }

    display(foundData);
}

async function getData(Location){
    newLocation(Location);
    isLoading(true);
    const ForecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${Location}&days=7`);
    const ForecastData = await ForecastResponse.json();
    isLoading(false);

    current_data = ForecastData;
    searchInput.value = "";
    findData(ForecastData);
}   

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const location = searchInput.value;
    if(!location) return;

    try {
        await getData(location);
    } catch (error) {
        searchInput.value = "";
        return;
        console.error("Error fetching data:", error);
    }
});

const handletoggle=()=>{
    unit = unit == 'C'? 'F' : 'C';
    if(unit=='C'){
        C.classList.add('active');
        F.classList.remove('active');
    }else {
        F.classList.add('active');
        C.classList.remove('active');
    }

    localStorage.setItem("unit", unit);
    findData(current_data);
}

toggle_unit.addEventListener('click', handletoggle)


start();