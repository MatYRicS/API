var axios = require('axios');
var cheerio = require('cheerio');
const csv = require('csvtojson');

var base = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';

var jhudata = async (keys, redis) => {
  let response;
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, 0);

  for (let day = today.getDate(); day > 0; day--) {
    try {
      response = await axios.get(`${base}${month}-${day.toString().padStart(2, 0)}-${year}.csv`);
      console.log(`USING ${month}-${day.toString().padStart(2, 0)}-${year}.csv CSSEGISandData`);
      break;
    } catch (err) {
      null;
    }
  }

  const parsed = await csv({
    noheader: true,
    output: 'csv'
  }).fromString(response.data);

  // to store parsed data
  const result = [];

  for (const loc of parsed.splice(1)) {
    result.push({
      country: loc[1],
      province: loc[0] === '' ? null : loc[0],
      updatedAt: loc[2],
      stats: {
        confirmed: loc[3],
        deaths: loc[4],
        recovered: loc[5]
      },
      coordinates: {
        latitude: loc[6],
        longitude: loc[7]
      }
    });
  }
  const string = JSON.stringify(result);
  redis.set(keys.jhu, string);
  console.log(`Updated JHU CSSE: ${result.length} locations`);
};

module.exports = jhudata;
