const { Telegraf } = require('telegraf');
const axios = require('axios');
const { Telegraf, session } = require('telegraf');

// Inicializa el bot con tu token (asegúrate de configurar la variable en Netlify)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

//Middleware para sesiones
bot.use(session());

// Middleware para enviar un mensaje antes de que el usuario use cualquier comando
bot.use(async (ctx, next) => {
    if (!ctx.session || !ctx.session.started) {
        ctx.session = { started: true }; // Marca que el usuario ya ha sido recibido
        await ctx.reply('¡Bienvenido! Usa el comando /start para obtener instrucciones.');
await ctx.reply('¡Hola! Estoy usando la App de Global66, regístrate con mi link y tienes de'); await ctx.reply('regalo tú primera transacción gratis.');
await ctx.reply('https://app.global66.com/QR8h/sktqzn4k');
    }
    return next(); // Continúa al siguiente middleware o comando
});

// Comando /start para guiar al usuario
bot.start((ctx) => {
    ctx.reply('Hola! Envíame una fecha en formato YYYY-MM-DD para consultar el valor de la TRM en esa fecha.');
});

// Manejo de cualquier texto enviado
bot.on('text', async (ctx) => {
    const userDate = ctx.message.text;
    if (validateDate(userDate)) {
        const value = await getValueFromAPI(userDate);
        if (value) {
            ctx.reply(`El valor de la TRM a la fecha ${userDate} es ${value}.`);
        } else {
            ctx.reply(`No se encontró un valor para la fecha ${userDate}.`);
        }
    } else {
        ctx.reply('Por favor, ingresa una fecha válida en el formato YYYY-MM-DD para consultar la TRM de esa fecha.');
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
        const userDateObj = new Date(userDate);
        userDateObj.setHours(0, 0, 0, 0); // Asegúrate de comparar solo la fecha

        for (let item of data) {
            const vigenciaDesde = new Date(item.vigenciadesde);
            const vigenciaHasta = new Date(item.vigenciahasta);
            vigenciaDesde.setHours(0, 0, 0, 0);
            vigenciaHasta.setHours(0, 0, 0, 0);

            if (vigenciaDesde <= userDateObj && userDateObj <= vigenciaHasta) {
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
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return {
            statusCode: 200,
            body: '',
        };
    } catch (error) {
        console.error('Error en el handler de Netlify:', error);
        return {
            statusCode: 500,
            body: 'Error en el servidor',
        };
    }
};
