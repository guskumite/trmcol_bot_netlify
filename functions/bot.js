const { Telegraf } = require('telegraf');
const axios = require('axios');

// Inicializa el bot con tu token (asegúrate de configurar la variable en Netlify)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply('Hola! Envíame una fecha en formato YYYY-MM-DD para consultar el valor de la TRM para esa fecha.'));

bot.on('text', async (ctx) => {
    const userDate = ctx.message.text;
    if (validateDate(userDate)) {
        const value = await getValueFromAPI(userDate);
        if (value) {
            ctx.reply(`El valor correspondiente a la fecha ${userDate} es ${value}.`);
        } else {
            ctx.reply(`No se encontró un valor para la fecha ${userDate}.`);
        }
    } else {
        ctx.reply('Por favor, ingresa una fecha válida en el formato YYYY-MM-DD.');
    }
});

// Función de validación de fecha
function validateDate(dateStr) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateStr);
}

// Función para obtener el valor de la API
async function getValueFromAPI(userDate) {
    const url = 'https://www.datos.gov.co/resource/mcec-87by.json';
    try {
        const response = await axios.get(url);
        const data = response.data;
        for (let item of data) {
            const vigenciaDesde = item.vigenciadesde;
            const vigenciaHasta = item.vigenciahasta;
            if (vigenciaDesde <= userDate && userDate <= vigenciaHasta) {
                return item.valor;
            }
        }
        return null;
    } catch (error) {
        console.error('Error al consultar la API:', error);
        return null;
    }
}

// Configura el handler para Netlify Functions
exports.handler = async function (event, context) {
    await bot.handleUpdate(JSON.parse(event.body));
    return {
        statusCode: 200,
        body: '',
    };
};
