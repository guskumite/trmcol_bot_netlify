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
