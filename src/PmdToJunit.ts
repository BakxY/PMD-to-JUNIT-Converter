import * as fs from 'fs';
import * as xml from 'xml-js';
import * as commander from 'commander';
import * as path from 'path';

commander.program.addOption(new commander.Option(
    '-s, --source <string>',
    'Report file created by PMD'
).makeOptionMandatory());
commander.program.addOption(new commander.Option(
    '-p, --path <string>',
    'The path to the folder where PMD was ran on'
).makeOptionMandatory());
commander.program.addOption(new commander.Option(
    '-o, --output <string>',
    'The to report converted to JUnit'
).makeOptionMandatory());

commander.program.parse();

async function main() {
    const options = commander.program.opts();

    const pathToSource = path.normalize(options['source']);
    if (!fs.existsSync(pathToSource)) {
        console.error('Source file doesn\'t exist!');
        return;
    }

    const runPath = path.normalize(options['path']);
    if (!fs.existsSync(runPath)) {
        console.error('Run path doesn\'t exist!');
        return;
    }

    const pathToOutput = path.normalize(options['output']);
    if (fs.existsSync(pathToOutput)) {
        console.error('Output file already exists!');
        return;
    }

    const xmlOrgData = fs.readFileSync(pathToSource, 'utf8');

    const jsonOrgData = xml.xml2js(xmlOrgData, { compact: true });
}

main()