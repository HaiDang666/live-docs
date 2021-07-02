import Path from 'path';
import Fs from 'fs';
import Ejs from 'ejs';
import MarkdownInclude from 'markdown-include';
import NetworkConfigJson from 'dot-crypto/src/network-config/network-config.json';

const TemplatesDir = Path.join('templates');
const ContractsDir = Path.join(TemplatesDir, 'contracts');
const MarkdownFile = Path.join(TemplatesDir, 'markdown', 'cns-smart-contracts-markdown.json');
const TemplateToRender = Path.join(TemplatesDir, 'cns-smart-contracts-template.md');
const FileToRender = Path.join('src', 'domain-registry-essentials', 'cns-smart-contracts.md');
const CotractTableTemplate = Fs.readFileSync(Path.join(ContractsDir, 'contract-table-template.ejs'), 'utf-8');
const Networks: Record<number, string> = {
    1: 'Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    5: 'Goerli',
    42: 'Kovan',
};

type Row = {
    network: string,
    address: string,
    legacyAddresses: string[],
}

void renderContractAddresses();

async function renderContractAddresses() {
    console.log('Rendering [' + FileToRender + ']');
    console.log('From template [' + TemplateToRender + ']');

    let filesToInclude: string[] = [TemplateToRender];

    for (let contract of getContracts()) {
        generateContractTables(contract, filesToInclude);
    }
    await compileContractTables(filesToInclude);
    console.log('Done');
}

function getContracts(): Set<string> {
    let contractSet = new Set<string>();

    Object.keys(NetworkConfigJson.networks).forEach(id => {
        const networkContracts = NetworkConfigJson.networks[id as keyof typeof NetworkConfigJson.networks].contracts;
        Object.keys(networkContracts).forEach(contract => contractSet.add(contract));
    });
    return contractSet;
}

function generateContractTables(contractName: string, filesToInclude: string[]) {
    let rows: Array<Row> = [];
    let contractHasLegacyAddresses: boolean = false;

    for (const id of Object.keys(NetworkConfigJson.networks)) {
        const networkContracts = NetworkConfigJson.networks[id as keyof typeof NetworkConfigJson.networks].contracts;
        let contract = networkContracts[contractName as keyof typeof networkContracts];
        if (!contract) {
            continue;
        }
        let legacyAddresses = contract.legacyAddresses;
        contractHasLegacyAddresses = contractHasLegacyAddresses || legacyAddresses.length > 0;

        rows.push({
            network: Networks[Number(id)],
            address: contract.address,
            legacyAddresses: contract.legacyAddresses,
        });
    }
    let contractTable = Ejs
        .render(CotractTableTemplate, { rows, hasLegacyAddresses: contractHasLegacyAddresses })
        .replace(/(^[ \t]*\n)/gm, ''); // remove new lines to render .md table properly

    saveContractTable(contractName, contractTable, filesToInclude);
}

function saveContractTable(contractName: string, contractTable: string, filesToInclude: string[]) {
    let filename = Path.join(ContractsDir, contractName + '.md');
    Fs.writeFileSync(filename, contractTable, 'UTF-8');
    filesToInclude.unshift(filename);
    console.log('Contract table saved: ' + filename)
}

async function compileContractTables(files: string[]) {
    saveMarkdown(files);
    await MarkdownInclude.compileFiles(MarkdownFile);
}

function saveMarkdown(files: string[]) {
    let markdown = {
        "build": FileToRender,
        "files": files,
    }
    Fs.writeFileSync(MarkdownFile, JSON.stringify(markdown, null, 4), 'UTF-8');
    console.log('Markdown file saved: ' + MarkdownFile)
}
