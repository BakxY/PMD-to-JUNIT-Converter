import * as fs from 'fs';
import * as xml from 'xml-js';
import * as commander from 'commander';
import * as path from 'path';
import * as os from 'os';
import * as xmlbuilder from 'xmlbuilder';

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

    const jsonOrgData = xml.xml2js(xmlOrgData);

    let junitRoot: any = xmlbuilder.create('PMD');

    junitRoot.att('timestamp', 'tests');
    junitRoot.att('hostname', os.hostname);
    junitRoot.att('testes', 'LENGTH');
    junitRoot.att('errors', '0');
    junitRoot.att('failures', '0');
    junitRoot.att('skipped', '0');

    const pmdElements = jsonOrgData.elements[0].elements;

    for(let elemIndex = 0; elemIndex < pmdElements.length; elemIndex++)
    {
        if(pmdElements[elemIndex].name != 'file') { continue; }

        const currentTestcase = junitRoot.ele('testcase');
        currentTestcase.att('name', path.normalize(pmdElements[elemIndex].name));
        currentTestcase.att('time', '3.0e-05');
        currentTestcase.att('classname', 'PMD analysis');

        const fileViolations = pmdElements[elemIndex].elements;
        
        for(let violationIndex = 0; violationIndex < fileViolations.length; violationIndex++)
        {
            
        }
    }

    var junitXml = junitRoot.end({ pretty: true});
    console.log(junitXml);
}

main()