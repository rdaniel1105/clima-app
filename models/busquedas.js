const fs = require("fs");

const axios = require("axios");

class Busquedas {
  searchHistory = [];
  dbPath = "./db/database.json";

  constructor() {
    // TODO: leer DB si existe

    // Otra forma
    // const key = Object.keys(this.leerDB());
    // this.leerDB()[key].forEach(element => {
    //     this.historial.push(element);
    // });

    // forma del chavalo xd
    this.readFromDB();
  }

  set setparamsOpenWeatherMap(lugarSelected) {
    this.lat = lugarSelected.lat;
    this.lon = lugarSelected.lng;
  }

  get paramsMapBox() {
    return {
      language: "es",
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
    };
  }

  get getparamsOpenWeatherMap() {
    return {
      lat: this.lat,
      lon: this.lon,
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  get titleCaseArray() {
    // Como lo hice primero
    // const historialCap = [];
    // this.historial.forEach( algo => {
    //     const alguito = algo.split(" ");
    //     let ultimaXd = '';
    //     for (let i = 0; i < alguito.length; i++) {
    //         const primera =    alguito[i].match(/[a-z]/);
    //         const primeraCap = primera[0].toUpperCase();
    //         const completa = primeraCap + alguito[i].slice(1,alguito[i].length);

    //         ultimaXd += ` ${completa}`;
    //     }
    //     historialCap.push(ultimaXd);
    // })
    // return historialCap;

    return this.searchHistory.map((lugar) => {
      let palabrasSeparadas = lugar.split(" ");
      if (palabrasSeparadas.length > 0)
        palabrasSeparadas = palabrasSeparadas.map(
          (p) => p[0].toUpperCase() + p.substring(1)
        );
      return palabrasSeparadas.join(" ");
    });
  }

  async pullPlaceData(lugar = "") {
    // console.log('ciudad: ',lugar);

    try {
      // Petición HTTP
      const instace = axios.create({
        baseURL: process.env.MAPBOX_URL + `${lugar}.json`,
        params: this.paramsMapBox,
      });

      const resp = await instace.get();

      // Hacerlo normal, pero también se puede regresar un objeto implícito
      // return resp.data.features.map( lugar => {
      //     return {
      //         id: lugar.id,
      //         nombre: lugar.place_name,
      //         lng: lugar.center[0],
      //         lat: lugar.center[1]
      //     }
      // })

      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      throw error;
    }
  }

  async pullPlaceWeather(placeSelected) {
    try {
      this.setparamsOpenWeatherMap = placeSelected;
      const instance = axios.create({
        baseURL: process.env.OPENWEATHERMAP_URL,
        params: this.getparamsOpenWeatherMap,
      });

      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
        sensation: weather[0].description,
      };
    } catch (error) {
      return console.log(error);
    }
  }

  addToSearchHistory(lugar = "") {
    // TODO: Prevenir duplicidad
    if (this.searchHistory.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.searchHistory.unshift(lugar.toLocaleLowerCase());
    this.searchHistory = this.searchHistory.splice(0, 5);

    this.saveToDB();
  }

  saveToDB() {
    const payload = {
      searchHistory: this.searchHistory,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  readFromDB() {
    if (!fs.existsSync(this.dbPath)) return null;
    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);
    // return data; hacerlo como lo hice primero
    this.searchHistory = data.searchHistory;
  }
}

module.exports = {
  Busquedas,
};
