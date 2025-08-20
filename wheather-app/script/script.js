// --------------------------------------------------- Declare the Constant variable  --------------------------------------------------- 
//Document Elements 
const inputField = document.getElementById('inputField');
const searchBtn = document.getElementById('searchBtn');
const inputFieldError = document.getElementById('inputFieldError');

// other elements required 
const UpdateCityName = document.getElementById('UpdateCityName');
const UpdatePrecipitation = document.getElementById('UpdatePrecipitation');
const UpdateTemprature = document.getElementById('UpdateTemprature');
const UpdateWeathericon = document.getElementById('UpdateWeathericon');
const Update24HForcastCard = document.getElementById('Update24HForcastCard');
const Update7DForcast = document.getElementById('Update7DForcast');
const UpdateOtherConditions = document.getElementById('UpdateOtherConditions');
const Loader = document.querySelectorAll('iframe');

//Universal Variable Set
let uv={cityName:'New Delhi',loader:'Lodding '};
let intervel;
const weatherIcons = {"0": "Clear Sky","1": "Mainly Clear","2": "Partly Cloudy","3": "Overcast","45": "Fog","48": "Fog","51": "Drizzle","53": "Drizzle","55": "Drizzle","61": "Light Rain","63": "Rain","65": "Heavy Rain","71": "Light Snow","73": "Snow","75": "Heavy Snow","80": "Showers Rain","81": "Showers Rain","82": "Showers Rain","95": "Thunder Storm","96": "Thunder Storm","99": "Thunder Storm"};
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


//  ---------------------------------------------------  Setting the Event Listener  --------------------------------------------------- 
//Event Listener on Input Field
inputField.addEventListener("input",(event)=>{
  inputFieldError.style.display="none";  // ==> { Step 2 }
  if(event.target.value !=" " || event.target.value !=""){
    searchBtn.style.display="flex";  // ==> { Step 2 }
  }
});

// Even Listener in Button clicked
searchBtn.addEventListener("click",async () => {
  if(!inputField.value || inputField.value==" " || inputField.value=="" || inputField.value.length<=0){
    showError("Field Is Empty!");
  }
  else{ // ==> { Step 3 }
    uv.cityName=inputField.value;  // ==> { Step 3.1 }
    functionCaller(uv.cityName); // ==> { Step 4 }
    searchBtn.style.display="none"; // ==> { Step 3.2 }
    inputField.value="";   // ==> { Step 3.3 }
  }
});


//  ---------------------------------------------------  Setting up the Functions  --------------------------------------------------- 
//Functions that call all the function in it 
const functionCaller = async (cityName) =>{
  setLoader();  // ==> { Step 5 }  till the fetching data 
  let data = await checkCity(cityName); // ==> { Step 6 }
  if(data){
    uv.cityName=data.results[0].admin1;
    let currentReport = await getCurentReport(data.results[0].latitude, data.results[0].longitude);  // ==> { Step 7 }
    if(currentReport){
      setDataToDOM(data,currentReport) // ==> { Step 8 }
    }
  }
}

// Show the error if any come during the runtime 
const showError = (message) =>{
  inputFieldError.innerHTML=`
  <p class="error">🚫 &nbsp; ${message}</p>
  `;
  inputFieldError.style.display="flex";
}

// it get the weather data return back
const getCurentReport = async (lat,lon) => {
  let apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_clear_sky_max&hourly=temperature_2m,rain,precipitation,precipitation_probability,showers,snowfall,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_54cm,soil_temperature_18cm,uv_index,is_day,apparent_temperature&current=temperature_2m,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&timezone=auto&forecast_hours=24`
  const data =await fetchapiData(apiUrl);
  if(data.flag && data.message){
    return data.message;
  }
  else{
    showError("Con't Get Weather Report (Server Error)");
    return false;
  }
}

// this function help in checking the input city name is valid or not
const checkCity = async (cityName) =>{
  let apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`;
  const data = await fetchapiData(apiUrl);
  if(data.flag){
    if(data.message.results && data.message.results.length > 0){
      return data.message;
    }
    else{
      showError("Enter A Valid City Name !");
      return false;
    }
  }else{
    showError(data.message);
    return false;
  }
}

// This function help in fetch the api data and return if promise resolve
function fetchapiData(apiUrl){
  return new Promise((resolve, reject) => {
    fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        let report ={flag:true, message:data};
        resolve(report);
      }
      else {
        resolve({flag:false,message:"No Data Found"});
      }
    })
    .catch((error) => {
      alert("🚫 😔😔 May Your Internet Is Not Working Properly 😔😔 🚫");
      showError("🚫 May Your Internet Is Not Working Properly 🚫")
      reject({flag:false,message:"Can't Get Data (Server Erroe)",error:error});
    });
  })
}

// This function help in settingup the data to the dom (html)
const setDataToDOM = (data1,data2) => {
  clearInterval(intervel);
  Loader.forEach((showLoader)=>{
    showLoader.style.display="none";
  });

  UpdateCityName.innerHTML = data1.results[0].admin2?data1.results[0].admin2:data1.results[0].admin1;
  UpdatePrecipitation.innerHTML = `chance of Rain : ${data2.current.rain} %`;
  UpdateTemprature.innerHTML = `${data2.current.temperature_2m} &deg;c`;
  let Tcode = data2.current.time.split("T")[1]; // "20:00"
  let cCode = parseInt(Tcode.split(":")[0])>18 ? "n" : "d" ;
  UpdateWeathericon.innerHTML = `<img src="./weather-icon/${data2.current.weather_code}${cCode}.svg" alt="${weatherIcons[data2.current.weather_code]}">`;

  for(let i=0; i<data2.hourly.temperature_80m.length;i++){

    let Tcode = data2.hourly.time[i].split("T")[1]; // "20:00"
    let cCode = parseInt(Tcode.split(":")[0])>18 ? "n" : "d" ;
    let cAmPmCode = parseInt(Tcode.split(":")[0])<12 ? "Am" : "Pm" ;

    let card = document.createElement('div');
    card.setAttribute('class', 'card');
    card.innerHTML = `
      <p class="text-center">${Tcode} ${cAmPmCode}</p>
      <img src="./weather-icon/${data2.hourly.weather_code[i]}${cCode}.svg" alt="${weatherIcons[data2.hourly.weather_code[i]]}">
      <p class="text-center">${parseInt(data2.hourly.temperature_80m[i])} &deg;c</p>
    `;

    Update24HForcastCard.appendChild(card);
  }

  UpdateOtherConditions.innerHTML=`
    <div class="card feel">
        <p>Real Feel</p>
        <h2>${parseInt(data2.current.temperature_2m)-1} &deg;c</h2>
    </div>
    <div class="card wind">
        <p>Wind</p>
        <h2>${parseInt(data2.current.wind_speed_10m)} km/h</h2>
    </div>
    <div class="card rain">
        <p>Chances of Rain</p>
        <h2>${parseInt(data2.current.rain)} &percnt;</h2>
    </div>
    <div class="card uv">
        <p>UV Index</p>
        <h2>${parseInt(data2.daily.uv_index_max[0])}</h2>
    </div>
  `;

  for(let i=0;i<data2.daily.temperature_2m_max.length;i++){

    let date = new Date(data2.daily.time[i]);
    const dayName = days[date.getDay()];

    let card = document.createElement("div");
    card.setAttribute("class","card");
    card.innerHTML=`
      <p>${dayName}</p>
      <div class="weather">
          <img src="./weather-icon/${data2.daily.weather_code[i]}d.svg" />
          <p class="margin-l-1">${weatherIcons[data2.daily.weather_code[i]]}</p>
      </div> 
      <p class="tag">${parseInt(data2.daily.temperature_2m_max[i])}/${parseInt(data2.daily.temperature_2m_max[i])} &deg;c</p>
    `;
    Update7DForcast.appendChild(card);
  }
}

// This function help in show the loader during the api fetching data amd it also reset the data 
// also reset the dom(html) data
const setLoader = () => {
  Update24HForcastCard.innerHTML=``;
  Update7DForcast.innerHTML=``;
  let count = 0;
  intervel=setInterval(() => {
    if(count>=4){
      uv.loader ="Lodding ";
      count = 0;
    }
    uv.loader += ".";
    count++;
    UpdateCityName.innerHTML =`<h1 class="loaderTag">${uv.loader}</h1>`;
    UpdatePrecipitation.innerHTML = ``;
    UpdateTemprature.innerHTML = `<h1 class="loaderTag">${uv.loader}</h1>`;
    UpdateWeathericon.innerHTML = `<h3 class="loaderTag">${uv.loader}</h3>`;
    UpdateOtherConditions.innerHTML=`
      <div class="card feel">
          <p>Real Feel</p>
          <p class="loaderTag" >${uv.loader}</p>
      </div>
      <div class="card wind">
          <p>Wind</p>
          <p class="loaderTag" >${uv.loader}</p>
      </div>
      <div class="card rain">
          <p>Chances of Rain</p>
          <p class="loaderTag" >${uv.loader}</p>
      </div>
      <div class="card uv">
          <p>UV Index</p>
          <p class="loaderTag" >${uv.loader}</p>
      </div>
    `;
  }, 1000);
  Loader.forEach((showLoader)=>{
    showLoader.style.display="flex";
  });
}


// ---------------------------------------------------  Calling a initial function   ---------------------------------------------------  
// Initial Function Call
functionCaller(uv.cityName);    // ==> { Step 1 }