const axios = require("axios");

const geocodeAddress = async(address) => {
    try {
        const encodedAddress = encodeURIComponent(address);

        const url =
            `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

        const response = await axios.get(url, {
            headers: {
                "User-Agent": "BachatGatApp"
            }
        });

        if (!response.data || response.data.length === 0) {
            return {
                latitude: null,
                longitude: null
            };
        }

        return {
            latitude: parseFloat(response.data[0].lat),
            longitude: parseFloat(response.data[0].lon)
        };

    } catch (error) {
        return {
            latitude: null,
            longitude: null
        };
    }
};

module.exports = geocodeAddress;