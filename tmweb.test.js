const puppeteer = require("puppeteer");
const { clickElement, choosesPlace, choosesWeekDay, choosesSeance } = require("./lib/commands.js");

let page;
const day = 6;
const seanceNum = 1;
const hallNum = 1;
const row = 9;
const chair = 3;
const row1 = 9;
const chair1 = 4;
const buttonBook = ".acceptin-button";

beforeEach(async () => {
    page = await browser.newPage();
    await page.goto("http://qamid.tmweb.ru/client/index.php");
});

afterEach(() => {
    page.close();
});

describe("Happy path tests", () => {
    test("Booking one ticket", async () => {   
        await choosesWeekDay(page, day);
        const movieName = await page.$eval(
            `.movie:nth-child(${hallNum}) .movie__title`,
            (link) => link.textContent
        );
        await choosesSeance(page, hallNum, seanceNum);
        await choosesPlace(page, row, chair);
        await clickElement(page, buttonBook);
        const cost = await page.$eval(
            `.ticket__cost`,
            (link) => link.textContent
        );
        const actualPlace = await page.$eval(
            `.ticket__chairs`,
            (link) => link.textContent
        );
        const actualMovieName = await page.$eval(
            `.ticket__title`,
            (link) => link.textContent
        );
        const title = await page.$eval(
            `.ticket__check-title`,
            (link) => link.textContent
        );
        
        await expect(title).toContain("Вы выбрали билеты:");
        await expect(cost).toContain("150");
        await expect(actualPlace).toContain(`${row}/${chair}`);
        await expect(actualMovieName).toEqual(movieName);
    });

    test("Booking two tickets", async () =>{
        await choosesWeekDay(page, day);
        await choosesSeance(page, hallNum, seanceNum);
        await choosesPlace(page, row, chair);
        await choosesPlace(page, row1, chair1);
        await clickElement(page, buttonBook);
        const cost = await page.$eval(
            `.ticket__cost`,
            (link) => link.textContent
        );
        const actualPlace = await page.$eval(
            `.ticket__chairs`,
            (link) => link.textContent
        );
        const title = await page.$eval(
            `.ticket__check-title`,
            (link) => link.textContent
        );
        
        await expect(title).toBe("Вы выбрали билеты:");
        await expect(cost).toContain("300");
        await expect(actualPlace).toContain(`${row}/${chair}, ${row1}/${chair1}`);
    })
});

describe("Sad path test", () => {
    test("Booking reserved chair", async () => {
        await choosesWeekDay(page, day);
        await choosesSeance(page, hallNum, seanceNum);
        await choosesPlace(page, row, chair);
        await clickElement(page, buttonBook);
        await clickElement(page, buttonBook);

        await page.goto("http://qamid.tmweb.ru/client/index.php");
        await choosesWeekDay(page, day);
        await choosesSeance(page, hallNum, seanceNum);
        await choosesPlace(page, row, chair);
        const selectedChair = `div.buying-scheme__row:nth-child(${row}) span:nth-child(${chair})`;
        const actualStatus = await page.$eval(selectedChair, (link) => link.className);
        
        await expect(actualStatus).toContain("chair_taken");
    })
})