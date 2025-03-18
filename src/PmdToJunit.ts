import * as fs from 'fs';
import * as xml from 'xml-js';
import * as commander from 'commander';

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

    console.log(options);
}

main()