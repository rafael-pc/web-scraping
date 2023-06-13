const pup = require('puppeteer');
const url = 'https://www.amazon.com.br/';
const search = 'notebook';

let cont = 1;
const list = [];

(async () => {
  const browser = await pup.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Abrindo o navegador...');

  await page.goto(url);
  console.log('Acessando o site...');

  await page.waitForSelector('#twotabsearchtextbox');

  await page.type('#twotabsearchtextbox', search);

  await Promise.all([
    page.waitForNavigation(),
    page.click('#nav-search-submit-button')
  ]);

  const links = await page.$$eval('.a-section.a-spacing-none.a-spacing-top-small.s-title-instructions-style a', el => el.map(link => link.href));

  for (const link of links) {
    if (cont === 4) continue;
    console.log('pagina:', cont);

    await page.goto(link);

    const title = await page.evaluate(() => {
      const element = document.querySelector('#productTitle')
      if (element) {
        return element.innerText
      }
      return '';
    })

    const price = await page.evaluate(() => {
      const element = document.querySelector('.a-price-whole')
      if (element) {
        return element.innerText
      }
      return '';
    })

    const obj = {
      title: title,
      price: price,
    };

    list.push(obj);

    cont++;
  }
  console.log(list);

  await new Promise(r => setTimeout(r, 2000));

  console.log('Fechando o navegador...');
  await browser.close();
})();