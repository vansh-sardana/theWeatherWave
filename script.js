const userTab= document.querySelector("[data-userWeather]");
const searchTab= document.querySelector("[data-searchWeather]");
const userContainer= document.querySelector(".weather-container");
const grantAcessContainer= document.querySelector(".grant-location-container");
const searchForm= document.querySelector("[data-search-form]");
const loadingScreen= document.querySelector(".loading-container");
const userInfoContainer= document.querySelector(".user-info-container");
const cityNotFound= document.querySelector("[data-cityNotFound]");

let currTab= userTab;
let API_KEY= "d1845658f92b31c64bd94f06f7188c9c";
currTab.classList.add('curr-tab');
getFromSessionStorage();

function switchTab(clickedTab){
    if(currTab!=clickedTab){
        currTab.classList.remove('curr-tab');
        currTab= clickedTab;
        currTab.classList.add('curr-tab');

        if(!searchForm.classList.contains('active')){
            searchForm.classList.add('active');
            grantAcessContainer.classList.remove('active');
            userInfoContainer.classList.remove('active');
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            cityNotFound.classList.remove("active");
            getFromSessionStorage();
        }

    }
}

userTab.addEventListener("click", ()=>{
    switchTab(userTab);
});
searchTab.addEventListener("click", ()=>{
    switchTab(searchTab);
});
const grantAccess= document.querySelector("[data-grantAccess]");
const messageText= document.querySelector("[data-accessMsg]");

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(savePosition, showError);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  
  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
  }

function savePosition(position) {
    console.log("here3");
    sessionStorage.setItem("user-coordinate", JSON.stringify({ "lat": position.coords.latitude, "lon":position.coords.longitude}) );
    getFromSessionStorage();
}
grantAccess.addEventListener("click", getLocation);

function getFromSessionStorage(){
    let location= sessionStorage.getItem("user-coordinate");
    grantAcessContainer.classList.remove("active");  
    if(!location){
        grantAcessContainer.classList.add("active");  
    }
    else{
        let coordinates = JSON.parse(location);
        fetchCoordinates(coordinates);
    }
}

async function fetchCoordinates(location){
    const {lat, lon}= location;
    loadingScreen.classList.add("active");
    //call API
    try{
        let weather= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        let data= await weather.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderData(data);
    }
    catch{
        loadingScreen.classList.remove("active");
    }
}

function renderData(data){
    const cityName= document.querySelector("[data-cityName]");
    const countryFlag= document.querySelector("[data-countryFlag]");
    const weatherDesc= document.querySelector("[data-weatherDesc]");
    const weatherIcon= document.querySelector("[data-weatherIcon]");
    const temp= document.querySelector("[data-temp]");
    const windSpeed= document.querySelector("[data-windSpeed]");
    const humidity= document.querySelector("[data-humidity]");
    const cloud= document.querySelector("[data-cloud]");

    cityName.innerText= data?.name;
    countryFlag.src= `https://flagcdn.com/32x24/${(data?.sys?.country).toLowerCase()}.png`;
    weatherDesc.innerText= data?.weather[0]?.main;
    weatherIcon.src= `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText= `${data?.main?.temp}°C`;
    windSpeed.innerText= `${data?.wind?.speed}m/s`;
    humidity.innerText= `${data?.main?.humidity}%`;
    cloud.innerText= `${data?.clouds?.all}%`;
}

const textInput= document.querySelector("[data-text-input]");
const dataMsg= document.querySelector("[data-msg]");
async function searchCity(cityName){
    userInfoContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    cityNotFound.classList.remove("active");
    //call API
    try{
        let weather= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
        let data= await weather.json();
        if(!data?.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        console.log(data);
        renderData(data);
    }
    catch(e){
        console.log(e);
        cityNotFound.classList.add("active");
        dataMsg.innerText= `${e?.message}`;
        loadingScreen.classList.remove("active");
        
    }
}

searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    let cityName= textInput.value;
    if(cityName==""){
        return;
    }
    else{
        searchCity(cityName);
    }
});