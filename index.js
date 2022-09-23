require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const { Busquedas } = require("./models/busquedas");
require('colors')


const main = async() => {
    
    const busquedas = new Busquedas();
    let opt;
    do {
        opt = await inquirerMenu();
        
        switch (opt) {
            case 1:
                
                // Mostrar mensaje
                const termino = await leerInput('Ciudad: ');
                // Buscar lugares
                const lugares = await busquedas.ciudad(termino);
                
                // Seleccionar lugar
                const idSeleccionado = await listarLugares(lugares);
                if ( idSeleccionado === '0') continue;
                const lugarSelected = lugares.find( l => l.id === idSeleccionado );
                // Guardar en DB
                busquedas.agregarHistorial(lugarSelected.nombre);
                // console.log(lugarSelected);
                // Clima
                const climaResults = await busquedas.clima(lugarSelected);
                // Mostrar resultados
                console.clear();
                console.log('\nInformación de la ciudad:\n'.green);
                console.log('Ciudad: ', lugarSelected.nombre );
                console.log('Lat: ', lugarSelected.lat );
                console.log('Lng: ', lugarSelected.lng );
                console.log('Temperatura: ', climaResults.temp);
                console.log('Mínima: ', climaResults.min);
                console.log('Máxima: ', climaResults.max);
                console.log('Sensación: ', climaResults.sensation);
                break;
        
            case 2:
                //busquedas.historial.forEach( (lugar,i) => {
                busquedas.historialCapitalizado.forEach( (lugar,i) => {
                    const idx = `${ i+1}.`.green;
                    console.log(`${idx} ${lugar}`);
                })
                
                break;
        }    
        if (opt !== 0) await pausa();
    } while (opt !== 0);
    

}

main();