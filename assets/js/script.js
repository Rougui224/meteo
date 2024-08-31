window.addEventListener("load", () => {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  cities.forEach(function (item) {
    displayCities(item);
  });

  // Recuper la date et l'heure actuelle
  const timeAreaElement = $(".header_date_time");
  const dateAreaElement = $(".header_date_area");

  function getDate() {
    //on recupere la date actuelle
    const currentDate = new Date();
    // et on la transforme au format local
    const currentTime = currentDate.toLocaleTimeString(navigator.language, {
      hour: "numeric",
      minute: "numeric",
      //   second: "numeric",
    });
    const localDate = currentDate.toLocaleDateString(navigator.language, {
      weekday: "long", // short (3 premières lettres), narrow (première lettre), long (toutes les lettres)
      year: "numeric", // numeric (xxxx), 2-digit (xx)
      month: "long", // short, narrow, long, numeric
      day: "numeric", // numeric, 2-digit
    });
    timeAreaElement.text(currentTime);
    dateAreaElement.text(localDate);
  }
  //   on recupere la météo en fonction de notre position
  const cityTitleElement = $(".defaultCity h2");
  const cityTempElement = $(".defaultCity p");
  const tempMinElement = $(".min span");
  const tempMaxElement = $(".max span");
  function getTempPerPosition(
    latitude,
    longitude,
    cityName,
    cityTemp,
    min,
    max
  ) {
    const url =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&appid=2562050363496ac4105718d1233d6c8c&units=metric";
    $.ajax({
      url,
      type: "GET",
      dataType: "json",
      success: (data) => {
        const roundedTemp = Math.round(data.main.temp);
        const roundedTempMin = Math.round(data.main.temp_min);
        const roundedTempMax = Math.round(data.main.temp_max);
        console.log(data);
        // Mettre à jour le DOM avec les valeurs arrondies
        cityName.text(data.name);
        cityTemp.text(`${roundedTemp} °C `);
        min.text(`${roundedTempMin}  °C`);
        max.text(`${roundedTempMax}  °C`);
      },
    });
  }
  let min = "",
    max = "";
  function getTempPerCity(cityName, cityTemp, city = "Paris") {
    const url =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&appid=2562050363496ac4105718d1233d6c8c&units=metric";
    $.ajax({
      url,
      type: "GET",
      dataType: "json",
      success: (data) => {
        const roundedTemp = Math.round(data.main.temp);
        min = `<i class="fa-solid fa-arrow-down"></i> ${Math.round(
          data.main.temp_min
        )}<span> °</span>`;
        max = `<i class="fa-solid fa-arrow-down"></i> ${Math.round(
          data.main.temp_max
        )}<span> °</span>`;
        // Mettre à jour le DOM avec les valeurs arrondies
        cityName.text(data.name);
        cityTemp.text(`${roundedTemp} °C `);
      },
    });
  }
  function displayTempPerCity(cityName, cityTemp, min, max, city) {
    const url =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&appid=2562050363496ac4105718d1233d6c8c&units=metric";
    $.ajax({
      url,
      type: "GET",
      dataType: "json",
      success: (data) => {
        const roundedTemp = Math.round(data.main.temp);
        const roundedTempMin = Math.round(data.main.temp_min);
        const roundedTempMax = Math.round(data.main.temp_max);

        // Mettre à jour le DOM avec les valeurs arrondies
        cityName.text(data.name);
        cityTemp.text(`${roundedTemp} °C`);
        min.text(`${roundedTempMin} °C `);
        max.text(`${roundedTempMax} °C `);
      },
    });
  }
  function setDefaultCity(city) {
    localStorage.setItem("city", JSON.stringify(city));
  }
  function error() {
    const cityName =
      JSON.parse(localStorage.getItem("city")) || prompt("Entrez votre ville");
    displayTempPerCity(
      cityTitleElement,
      cityTempElement,
      tempMinElement,
      tempMaxElement,
      cityName
    );
    setDefaultCity(cityName);
  }
  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition((position) => {
      getTempPerPosition(
        position.coords.latitude,
        position.coords.longitude,
        cityTitleElement,
        cityTempElement,
        tempMinElement,
        tempMaxElement
      );
    }, error);
  }

  // Ajouter une ville
  const addCityButton = $(".header_icon");
  const modalElement = $("#modal");
  const overlayElement = $("#overlay");
  const closeModalButton = $("#closeModalBtn");
  const sendButtonModal = $("#submitModalBtn");

  function addCityToLoclStorage(cityName) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    cities.push(cityName);
    localStorage.setItem("cities", JSON.stringify(cities));
  }
  function deleteCityToLocalStorage(cityName) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    console.log(cities);
    cities = cities.filter(function (city) {
      console.log(cityName.toUpperCase());
      return city !== cityName.toUpperCase();
    });
    localStorage.setItem("cities", JSON.stringify(cities));
  }
  addCityButton.click(function () {
    modalElement.show();
    overlayElement.show();
  });
  closeModalButton.click(function () {
    modalElement.hide();
    overlayElement.hide();
  });
  function displayCities(city) {
    const cityListItem = $(`<li class="cities_item">
            <i class="fa-solid fa-delete-left"></i>
            <span></span>
            <p></p>  </li>`);
    $(".cities").prepend(cityListItem);
    // Cibler uniquement les éléments span et p du dernier élément ajouté
    const cityNameElement = cityListItem.find("span");
    const cityTempElement = cityListItem.find("p");
    const cityDeleteButton = cityListItem.find(".fa-delete-left");
    const cityContainer = cityListItem.find("li");
    // Utilisation de la délégation d'événements pour le bouton de suppression
    cityDeleteButton.on("click", function () {
      $(this).closest("li").remove();
      deleteCityToLocalStorage(cityNameElement.text());
    });

    getTempPerCity(cityNameElement, cityTempElement, city);
  }
  //Ajouter une ville ======>
  sendButtonModal.on("click", function () {
    let inputValue = $("#modalInput").val().trim();
    if (inputValue === "") {
      return;
    } else {
      displayCities(inputValue);
      addCityToLoclStorage(inputValue.toUpperCase());

      modalElement.hide();
      overlayElement.hide();
    }
    // Pour vider le champ de formulaire
    $("#modalInput").val("");
  });

  setInterval(getDate, 60000);
  getDate();
});
