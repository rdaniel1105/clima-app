require("dotenv").config();

const {
  leerInput,
  inquirerMenu,
  pausa,
  searchResultsList,
} = require("./helpers/inquirer");
const { Busquedas } = require("./models/busquedas");
require("colors");

const main = async () => {
  const busquedas = new Busquedas();
  let option;
  do {
    option = await inquirerMenu();

    switch (option) {
      case 1:
        try {
          // Mostrar mensaje
          const place = await leerInput("Ciudad: ");
          // Buscar lugares
          const placeInfo = await busquedas.pullPlaceData(place);

          // Seleccionar lugar
          const placeId = await searchResultsList(placeInfo);
          if (placeId === "0") continue;
          const placeSelected = placeInfo.find((l) => l.id === placeId);
          // Guardar en DB
          busquedas.addToSearchHistory(placeSelected.place_name);
          // console.log(lugarSelected);
          // Clima
          const weatherInfo = await busquedas.pullPlaceWeather(placeSelected);
          // Mostrar resultados
          console.clear();
          console.log("\nInformación de la ciudad:\n".green);
          console.log("Ciudad: ", placeSelected.place_name);
          console.log("Lat: ", placeSelected.lat);
          console.log("Lng: ", placeSelected.lng);
          console.log("Temperatura: ", weatherInfo.temp);
          console.log("Mínima: ", weatherInfo.min);
          console.log("Máxima: ", weatherInfo.max);
          console.log("Sensación: ", weatherInfo.sensation);
          break;
        } catch (error) {
          throw error;
        }

      case 2:
        //busquedas.historial.forEach( (lugar,i) => {
        busquedas.titleCaseArray.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });

        break;
    }
    try {
      if (option !== 0) await pausa();
    } catch (error) {
      throw error;
    }
  } while (option !== 0);
};

main();
