import puppeteer from 'puppeteer'

export const getPriceBs = async function(){

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    await page.goto('https://www.bcv.org.ve')

    await page.waitForSelector('.col-sm-6.col-xs-6.centrado')
    const content = await page.content()

    console.log(content)

}