const puppeteer = require('puppeteer');
const creds = require('./creds');
const obj = require('./obj');

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto('https://github.com/login');

  await page.click(obj.username);
  await page.keyboard.type(creds.username);

  await page.click(obj.password);
  await page.keyboard.type(creds.password);

  await page.click(obj.button);
  await page.waitForNavigation();

  const userToSearch = 'brendan';
  const searchUrl = `https://github.com/search?q=${userToSearch}&type=Users&utf8=%E2%9C%93`;

  await page.goto(searchUrl);
  await page.waitFor(2 * 1000);

  const numPages = await getNumPages(page);

  console.log('Numpages: ', numPages);

  //for (let h = 1; h <= numPages; h++) {
  for (let h = 1; h <= 10; h++) {
    let pageUrl = searchUrl + '&p=' + h;
    await page.goto(pageUrl);

    let listLength = await page.evaluate((sel) => {
      return document.getElementsByClassName(sel).length;
    }, obj.length_class);

    for (let i = 1; i <= listLength; i++) {
      // change the index to the next child
      let usernameSelector = obj.list_username.replace("INDEX", i);
      let emailSelector = obj.list_email.replace("INDEX", i);

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
  }

  browser.close();
}

async function getNumPages(page) {
  const NUM_USER_SELECTOR = '#js-pjax-container > div > div.columns > div.column.three-fourths.codesearch-results > div > div.d-flex.flex-justify-between.border-bottom.pb-3 > h3';

  let inner = await page.evaluate((sel) => {
    let html = document.querySelector(sel).innerHTML;

    // format is: "69,803 users"
    return html.replace(',', '').replace('users', '').trim();
  }, NUM_USER_SELECTOR);

  const numUsers = parseInt(inner);

  console.log('numUsers: ', numUsers);

  /**
   * GitHub shows 10 resuls per page, so
   */
  return Math.ceil(numUsers / 10);
}



run();