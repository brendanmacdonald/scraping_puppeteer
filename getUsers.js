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
    const usersUrl = obj.github_users_url;
    await page.goto(usersUrl);

    // Get count of users on first page of results.
    let usersLength = await page.evaluate((sel) => {
        return document.getElementsByClassName(sel).length;
    }, obj.users);
    console.log('\nNumber of users on page: ', usersLength);

    console.log('\nUsers with username + an email address:')
    for (let i = 1; i <= usersLength; i++) {
        // change the index to the next child
        let usernameSelector = obj.username_selector.replace("INDEX", i);
        let emailSelector = obj.email_selector.replace("INDEX", i);
  
        let username = await page.evaluate((sel) => {
          return document.querySelector(sel).getAttribute('href').replace('/', '');
        }, usernameSelector);
  
        let email = await page.evaluate((sel) => {
          let element = document.querySelector(sel);
          return element ? element.innerHTML : null;
        }, emailSelector);
  
        // not all users have emails visible
        if (!email)
          continue;

        console.log(username, ' -> ', email);
      }

    browser.close();
}

run();