const fs = require("fs");
const currentYear = "2024";

function readTxtFile(filename, callback) {
  fs.readFile(filename, "utf8", callback);
}

function writeCSVFile(filename, data, callback) {
  fs.writeFile(filename, data, "utf8", callback);
}

function extractValues(line) {
  let regex = /Compra aprovada no seu (.+?) final \d+ - (.+?) valor RS (\d+,\d+) em (\d+\/\d+)/;
  let match = line.match(regex);

  if (!match) {
    regex = /Compra aprovada no (.+?) final \d+ - (.+?) - RS (\d+,\d+) em (\d+\/\d+)/;
    match = line.match(regex);

    if (!match) {
      console.error("Error: Invalid input text format.");
      return [];
    }
  }
  const [, conta, descricao, valor, data] = match;

  return [data, descricao, valor, conta, "Outros"];
}

function formatCurrencyValue(value) {
  if (!value) return;
  value = value.replace(".", "").replace(",", ".");
  return value;
}

function formatDateValue(value) {
  if (!value) return;
  value = `${value}/${currentYear}`;
  return value;
}

function addQuotingMark(values) {
  return values.map((value) => (value ? `"${value}"` : ""));
}

function createHeader() {
  const header = `"Data";"Descrição";"Valor";"Conta";"Categoria"`;
  return header;
}

function extractLines(csvData) {
  const lines = csvData.trim().split("\r\n");
  return lines;
}

function joinValues(line) {
  return line.join(";");
}

function joinLines(lines) {
  return lines.join("\n");
}

function setKnownCategory(values, description, category) {
  if (!values) return;
  if (values[1].toUpperCase().includes(description.toUpperCase())) values[4] = category;
  return values;
}

function setKnownCategories(values) {
  values = setKnownCategory(values, "-", '"Outros"');

  values = setKnownCategory(values, "AMAZON", '"Livre"');
  values = setKnownCategory(values, "DELL", '"Livre"');
  values = setKnownCategory(values, "MERCADOLIVRE", '"Livre"');
  values = setKnownCategory(values, "VIVARA", '"Livre"');
  values = setKnownCategory(values, "DECATHLON", '"Livre"');
  values = setKnownCategory(values, "CAMICADO", '"Livre"');

  values = setKnownCategory(values, "APPLE.COM/BILL", '"Streaming"');
  values = setKnownCategory(values, "SPOTIFY", '"Streaming"');
  values = setKnownCategory(values, "MELIMAIS", '"Streaming"');
  values = setKnownCategory(values, "HELPMAXCOM", '"Streaming"');

  values = setKnownCategory(values, "FLUKE", '"Servicos"');

  values = setKnownCategory(values, "LOJASRENNERSA", '"Vestuario"');
  values = setKnownCategory(values, "RIACHUELO", '"Vestuario"');
  values = setKnownCategory(values, "CEA", '"Vestuario"');
  values = setKnownCategory(values, "WORLDTENNIS", '"Vestuario"');
  values = setKnownCategory(values, "NETSHOES", '"Vestuario"');
  values = setKnownCategory(values, "CARTER", '"Vestuario"');

  values = setKnownCategory(values, "Compra ShellBox", '"Transporte"');
  values = setKnownCategory(values, "LIBERTY_BRAZIL", '"Transporte"');
  values = setKnownCategory(values, "POSTO", '"Transporte"');
  values = setKnownCategory(values, "COMBUSTIVEIS", '"Transporte"');

  values = setKnownCategory(values, "ALTERNATIVA RESTAURANT", '"Alimentacao"');
  values = setKnownCategory(values, "TREM MINEIRO", '"Alimentacao"');
  values = setKnownCategory(values, "SONIA MARIA FELIX REST", '"Alimentacao"');
  values = setKnownCategory(values, "PANIFICADORA", '"Alimentacao"');
  values = setKnownCategory(values, "PANDORO", '"Alimentacao"');
  values = setKnownCategory(values, "PADARIA", '"Alimentacao"');
  values = setKnownCategory(values, "quitanda", '"Alimentacao"');

  values = setKnownCategory(values, "SUP EPA", '"Supermercado"');
  values = setKnownCategory(values, "SUPERMERCADO", '"Supermercado"');
  values = setKnownCategory(values, "sacolao", '"Supermercado"');

  values = setKnownCategory(values, "LAGRANORISTORANTE", '"Lazer"');
  values = setKnownCategory(values, "SHOP", '"Lazer"');

  values = setKnownCategory(values, "HOTEL", '"Viagem"');
  values = setKnownCategory(values, "UBER", '"Viagem"');
  values = setKnownCategory(values, "AZUL WE", '"Viagem"');

  values = setKnownCategory(values, "DROGARIA", '"Saude"');
  values = setKnownCategory(values, "PHARMA", '"Saude"');
  values = setKnownCategory(values, "FARMA", '"Saude"');
  values = setKnownCategory(values, "HUMANAS", '"Saude"');
  values = setKnownCategory(values, "VIVAMUS", '"Saude"');

  values = setKnownCategory(values, "LEROY MERLIN", '"Casa"');
  values = setKnownCategory(values, "MP*UTILITYUTILID", '"Casa"');

  values = setKnownCategory(values, "PETZLOJAVIRTUAL", '"Pet Shop"');
  values = setKnownCategory(values, "PSA", '"Pet Shop"');
  values = setKnownCategory(values, "Educacao", '"EF ENGLISH LIVE"');

  return values;
}

function formatData(text) {
  const lines = extractLines(text);

  header = createHeader();

  // Process each data line
  let formattedLines = lines.map((line) => {
    let values = extractValues(line);

    if (!values[1]) return console.log({ line, values });
    values[0] = formatDateValue(values[0]);
    values[2] = formatCurrencyValue(values[2]);

    values = addQuotingMark(values);
    values = setKnownCategories(values);

    return joinValues(values);
  });

  formattedLines = [header, ...formattedLines];

  console.debug({ formattedLines });

  return joinLines(formattedLines);
}

function main() {
  let folder = "Cred. Azul";
  let title = "march";

  const inputFilename = `${folder}/${title}.txt`;
  const outputFilename = `${folder}/${title}-formatted.csv`;

  readTxtFile(inputFilename, (err, text) => {
    if (err) {
      console.error("Error reading the .txt file:", err);
      return;
    }

    const csvData = formatData(text);

    writeCSVFile(outputFilename, csvData, (err) => {
      if (err) {
        console.error("Error writing the CSV file:", err);
        return;
      }
      console.log("CSV file created successfully.");
    });
  });
}

main();
