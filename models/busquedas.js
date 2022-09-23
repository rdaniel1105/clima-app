const fs = require('fs');

const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath = './db/database.json';


    set setparamsOpenWeatherMap(lugarSelected) { 
        this.lat = lugarSelected.lat;
        this.lon = lugarSelected.lng;
    }

    get paramsMapBox() {
        return {
            'language':'es',
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5
        }
    }

    get getparamsOpenWeatherMap() {
        return {
            'lat': this.lat,
            'lon': this.lon,
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    constructor() {
        // TODO: leer DB si existe

        // Otra forma
        // const key = Object.keys(this.leerDB());
        // this.leerDB()[key].forEach(element => {
        //     this.historial.push(element);
        // });

        // forma del chavalo xd
        this.leerDB();
        
    }

    get historialCapitalizado() {
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

        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        })
    }

    async ciudad ( lugar='' ) {

        // console.log('ciudad: ',lugar);
        
        try {
            // Petición HTTP
            const instace = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapBox

            })
            
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

        return resp.data.features.map( lugar => ({
            id: lugar.id,
            nombre: lugar.place_name,
            lng: lugar.center[0],
            lat: lugar.center[1]
        }))

        } catch (error) {
            return [];
        }

    }

    async clima (lugarSelected) {
        
        try {
            this.setparamsOpenWeatherMap = lugarSelected;
            const instance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: this.getparamsOpenWeatherMap
            })

            const resp = await instance.get();
            const {weather,main} = resp.data;

            return {
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
                sensation: weather[0].description
            };
        } catch (error) {
            return console.log(error);
        }

    }

    agregarHistorial(lugar = '') {
        // TODO: Prevenir duplicidad
        if ( this.historial.includes( lugar.toLocaleLowerCase() )) {
            return
        }
        this.historial.unshift( lugar.toLocaleLowerCase() );
        this.historial = this.historial.splice(0,5);

        this.guardarDB();
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync( this.dbPath, JSON.stringify(payload) );
    }

    leerDB() {
        if (!fs.existsSync(this.dbPath)) return null;
        const info = fs.readFileSync(this.dbPath, {encoding:'utf-8'});
        const data = JSON.parse(info);
        // return data; hacerlo como lo hice primero
        this.historial = data.historial;
    }

}

module.exports = {
    Busquedas
}