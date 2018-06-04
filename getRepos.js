const puppeteer = require('puppeteer');
const creds = require('./creds');
const obj = require('./obj');

async function run() {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    // Login.
    await page.goto(obj.github_login);
    await page.click(obj.username);
    await page.keyboard.type(creds.username);
    await page.click(obj.password);
    await page.keyboard.type(creds.password);
    await page.click(obj.button);
    await page.waitForNavigation();

    // Visit a repo url page.
    const reposUrl = obj.github_repos_url;
    await page.goto(reposUrl);

    // Get count of repos.
    let reposLength = await page.evaluate((sel) => {
        return document.getElementsByClassName(sel).length;
    }, obj.repos_css);
    console.log('\nNumber of repos: ', reposLength);

    // Get repo names.
    let links = await page.evaluate((sel) => {
        let elements = Array.from(document.querySelectorAll(sel));
        let links = elements.map(element => {
            return element.href
        })
        return links;
    }, obj.repo_link);

    let name = await page.evaluate((sel) => {
        let elements = Array.from(document.querySelectorAll(sel));
        let links = elements.map(element => {
            return element.text
        })
        return links;
    }, obj.repo_link);

    for (let i = 1; i < reposLength; i++) {
        console.log(name[i] + ' -> ' + links[i])
    }

    browser.close();
}

run();