
const fs = require('fs');

function readCSVFile(filename, callback) {
  fs.readFile(filename, 'utf8', callback);
}

function writeCSVFile(filename, data, callback) {
  fs.writeFile(filename, data, 'utf8', callback);
}

function addQuotingMark(values){
  return values.map(value => `"${value}"`);
}

function removeCarriageReturn(values){
  return values.replace(/\r/g, '');
}

function formatCurrencyValue(values){
  return values.replace('.', '').replace('R$ ', '').replace(',', '.');
}

function renameHeaderTitles(header){
  header[1] = 'Descrição';
  header[2] = 'Conta';
  header[3] = 'Valor';
  header[4] = 'Categoria';
  return header;
}

function extractLines(csvData){
  const lines = csvData.trim().split('\n');
  return lines;
}

function extractValues(line){
  const values = line.split(';');
  return values;
}

function extractHeader(lines){
  const header = extractValues(lines.shift());
  return header;
}

function joinValues( line){
  return line.join(';');
}

function joinLines(lines){
  return lines.join('\n');
}

function switchColumnPosition(values, column1Position, column2Position) {
  if (values.length >= 4) {
    const temp = values[column1Position];
    values[column1Position] = values[column2Position];
    values[column2Position] = temp;
  }
  return values;
}

function setKnownCategory(values, description, category){
  if(values[1].toUpperCase().includes(description.toUpperCase())) values[4] = category;
  return values;
}

function setKnownCategories(values){
  values = setKnownCategory(values, "-",'"Outros"');

  values = setKnownCategory(values, "AMAZON",'"Livre"');
  values = setKnownCategory(values, "DELL",'"Livre"');
  values = setKnownCategory(values, "MERCADOLIVRE",'"Livre"');
  values = setKnownCategory(values, "VIVARA",'"Livre"');
  values = setKnownCategory(values, "DECATHLON",'"Livre"');
  values = setKnownCategory(values, "CAMICADO",'"Livre"');

  values = setKnownCategory(values, "APPLE.COM/BILL",'"Streaming"');  
  values = setKnownCategory(values, "SPOTIFY",'"Streaming"');  
  values = setKnownCategory(values, "MELIMAIS",'"Streaming"');   
  values = setKnownCategory(values, "HELPMAXCOM",'"Streaming"');   
  
  values = setKnownCategory(values, "FLUKE",'"Servicos"');  
  
  values = setKnownCategory(values, "LOJASRENNERSA",'"Vestuario"');  
  values = setKnownCategory(values, "RIACHUELO",'"Vestuario"');  
  values = setKnownCategory(values, "CEA",'"Vestuario"');  
  values = setKnownCategory(values, "WORLDTENNIS",'"Vestuario"');  
  values = setKnownCategory(values, "NETSHOES",'"Vestuario"');  
  values = setKnownCategory(values, "CARTER",'"Vestuario"');  
  
  values = setKnownCategory(values, "Compra ShellBox",'"Transporte"');   
  values = setKnownCategory(values, "LIBERTY_BRAZIL",'"Transporte"');   
  values = setKnownCategory(values, "POSTO",'"Transporte"');   
  values = setKnownCategory(values, "COMBUSTIVEIS",'"Transporte"');   
  
  values = setKnownCategory(values, "ALTERNATIVA RESTAURANT",'"Alimentacao"');   
  values = setKnownCategory(values, "TREM MINEIRO",'"Alimentacao"');   
  values = setKnownCategory(values, "SONIA MARIA FELIX REST",'"Alimentacao"');   
  values = setKnownCategory(values, "PANIFICADORA",'"Alimentacao"');   
  values = setKnownCategory(values, "PANDORO",'"Alimentacao"');   
  values = setKnownCategory(values, "PADARIA",'"Alimentacao"');   
  values = setKnownCategory(values, "quitanda",'"Alimentacao"');   
  
  values = setKnownCategory(values, "SUP EPA",'"Supermercado"');
  values = setKnownCategory(values, "SUPERMERCADO",'"Supermercado"'); 
  values = setKnownCategory(values, "sacolao",'"Supermercado"'); 
  
  values = setKnownCategory(values, "LAGRANORISTORANTE",'"Lazer"');   
  values = setKnownCategory(values, "SHOP",'"Lazer"');   
  
  values = setKnownCategory(values, "HOTEL",'"Viagem"');  
  values = setKnownCategory(values, "UBER",'"Viagem"');   
  values = setKnownCategory(values, "AZUL WE",'"Viagem"');   
  
  values = setKnownCategory(values, "DROGARIA",'"Saude"'); 
  values = setKnownCategory(values, "PHARMA",'"Saude"');   
  values = setKnownCategory(values, "FARMA",'"Saude"');   
  values = setKnownCategory(values, "HUMANAS",'"Saude"'); 
  values = setKnownCategory(values, "VIVAMUS",'"Saude"');   
  
  values = setKnownCategory(values, "LEROY MERLIN",'"Casa"');   
  values = setKnownCategory(values, "MP*UTILITYUTILID",'"Casa"');
  
  values = setKnownCategory(values, "PETZLOJAVIRTUAL",'"Pet Shop"');    
  values = setKnownCategory(values, "PSA",'"Pet Shop"');     
  values = setKnownCategory(values, "Educacao",'"EF ENGLISH LIVE"');     
  
  return values;
}


function formatCSVData(csvData) {
  let lines = extractLines(csvData);
  let header = extractHeader(lines);

  header = renameHeaderTitles(header);
  header = joinValues(header);

  lines = [header, ...lines];

  // Process each data line
  const formattedLines = lines.map(line => {
    let values = extractValues(line);

    values[3] = formatCurrencyValue(values[3]);
    values[4] = removeCarriageReturn(values[4]);

    values = addQuotingMark(values);
    values = switchColumnPosition(values, 2, 3)
    values = setKnownCategories(values);

    return joinValues(values);
  });

  console.debug({formattedLines})

  return joinLines(formattedLines);
}

function main() {
  let folder = "Cred. XP - Pablo"
  let title = "fatura-2024-04-10"

  const inputFilename = `${folder}/${title}.csv`;
  const outputFilename = `${folder}/${title}-formatted.csv`;

  readCSVFile(inputFilename, (err, data) => {
    if (err) {
      console.error('Error reading the CSV file:', err);
      return;
    }

    const formattedCSV = formatCSVData(data);

    writeCSVFile(outputFilename, formattedCSV, err => {
      if (err) {
        console.error('Error writing the formatted CSV file:', err);
        return;
      }
      console.log('CSV file formatted successfully.');
    });
  });
}

main();
