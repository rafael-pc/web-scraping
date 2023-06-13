const pup = require('puppeteer');
const fs = require('fs');

const site = 'https://db.libretro.com/'

const list = [];
let cont = 1;
let c = 1;
let pageLink = 1;

const nes = 'https://db.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/index-0.html';
const snes = 'https://db.libretro.com/Nintendo%20-%20Super%20Nintendo%20Entertainment%20System/index-0.html';

(async () => {
  const browser = await pup.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Abrindo o navegador...');

  await page.goto(site);
  console.log('Acessando o site...');

  await new Promise(r => setTimeout(r, 1000));

  const linksHome = await page.$$eval('.clearfix a', el => el.map(link => link.href));

  for (const link of linksHome) {
    if (link === snes) {
      await page.goto(link);
    }
  }

  const linksNES = await page.$$eval('.card-footer a', el => el.map(link => link.href));

  for (const link of linksNES) {
    const region = await page.evaluate(() => {
      const element = document.querySelector('.badge.badge-secondary')
      if (element) {
        return element.innerText
      }
      return '';
    })

    await page.goto(link);

    if (cont === 6) {
      await page.evaluate(() => {
        const lis = document.querySelectorAll('li'); // Seleciona todos os elementos <li> na página
        if (lis.length >= 3) {
          lis[2].click('.page-item a'); // Clica no terceiro elemento <li>
        }
      });
      await new Promise(r => setTimeout(r, 1000));
      cont = 1;
      pageLink++;
      console.log(`page: ${pageLink} ----------`);  
    }

    if (pageLink === 2) break;
    //if (cont === 4) continue;

    console.log('game:', cont);

    const title = await page.evaluate(() => {
      const element = document.querySelector('.col-sm p')
      if (element) {
        return element.innerText
      }
      return '';
    })

    const developer = await page.evaluate(() => {
      const element = document.querySelector('.table.table-sm.table-striped tr:nth-child(3) td a')
      if (element) {
        return element.innerText
      }
      return '';
    })

    const release = await page.evaluate(() => {
      const element = document.querySelector('.table.table-sm.table-striped tr:nth-child(2) td')
      if (element) {
        return element.innerText
      }
      return '';
    })

    const boxart = await page.evaluate(() => {
      const img = document.querySelector('.col-12.mb-4 img'); // Seletor para encontrar a tag <img>
      return img ? img.src : null; // Retorna o valor do atributo src ou null se a tag <img> não for encontrada
    });

    const snap = await page.evaluate(() => {
      const img = document.querySelector('.col-6.mb-4 img'); // Seletor para encontrar a tag <img>
      return img ? img.src : null; // Retorna o valor do atributo src ou null se a tag <img> não for encontrada
    });

    const obj = {
      id: c,
      title: title,
      developer: developer,
      release: release,
      region: region,
      boxart: boxart,
      snap: snap,
    };

    list.push(obj);
    cont++;
    c++;

    //await new Promise(r => setTimeout(r, 250));
  }

  console.log(list);

  // Escrever a estrutura de dados em um arquivo JSON
  fs.writeFile('dados.json', JSON.stringify(list), (err) => {
    if (err) {
      console.error('Erro ao escrever arquivo JSON:', err);
      return;
    }
    console.log('Arquivo JSON salvo com sucesso!');
  });

  console.log('Fechando o navegador...');
  await browser.close();
})();