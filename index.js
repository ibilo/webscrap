const request = require("request-promise");
const cheerio = require('cheerio');
const fs = require("fs");

async function main() {

    const html = await request.get("http://oblenergo.cv.ua/vidklyuchennya");
    const allShutdowns = await getAllShutdowns(html);

    // fs.writeFileSync('./test.html', html);
    // fs.writeFileSync('./mainData.json', mainData);
}

main();


async function getAllShutdowns(html) {

    const emergencyShutdowns = await getEmergencyShutdowns(html);
    const scheduledShutdowns = await getScheduledShutdowns(html);

    const allShutdowns = { emergencyShutdowns, scheduledShutdowns };
    // console.log(allShutdowns)

    let shutdowns = JSON.stringify(allShutdowns);
    fs.writeFileSync('mainData.json', shutdowns);
}

async function getEmergencyShutdowns(html) {

    const emergencyShutdowns = [];
    const allEmergencyRegions = [];

    const $ = await cheerio.load(html);

    const emergencyTitle = $(".cvu_vidkl > h2:nth-child(1)");
    const emergencyTables = $(".cvu_vidkl table.vpxml.t1");

    const emergencyTableHeadeers = $(emergencyTables).find('th');
    const emergencyTableRows = $(emergencyTables).find('tbody tr');


    emergencyTableRows.each((index, value) => {
        if (index === 0) return true;
        var obj = {};

        tableData = $(value).find('td');

        emergencyTableHeadeers.each((index, value) => {

            if (tableData.eq(index).text().includes('ЬКИЙ РЕМ')) {
                region = tableData.eq(index).text();
                allEmergencyRegions.push(region);
                obj.region = region;
            }
            obj.region = region;


            obj[$(value).text()] = tableData.eq(index).text();
        });

        emergencyShutdowns.push(obj);
    });

    // return {
    //     [$(emergencyTitle).text()]: emergencyShutdowns
    // };

    // "emergencyShutdowns": {
    //     "Аварійні відключення:": [{

    return emergencyShutdowns;
}

async function getScheduledShutdowns(html) {

    const scheduledShutdowns = [];
    const allScheduledRegions = [];
    const $ = await cheerio.load(html);

    const scheduledTitle = $(".cvu_vidkl > h2:nth-child(3)");
    const scheduledTables = $(".cvu_vidkl > table:nth-child(4)");

    const scheduledTableHeadeers = $(scheduledTables).find('th');
    const scheduledTableRows = $(scheduledTables).find('tbody tr');

    scheduledTableRows.each((index, value) => {
        if (index === 0) return true;
        var obj = {};

        tableData = $(value).find('td');

        scheduledTableHeadeers.each((index, value) => {

            if (tableData.eq(index).text().includes('ЬКИЙ РЕМ')) {
                region = tableData.eq(index).text();
                allScheduledRegions.push(region);
                obj.region = region;
            }
            obj.region = region;


            obj[$(value).text()] = tableData.eq(index).text();
        });

        scheduledShutdowns.push(obj);
    });

    // return {
    //     [$(scheduledTitle).text()]: scheduledShutdowns
    // };

    return scheduledShutdowns;
}