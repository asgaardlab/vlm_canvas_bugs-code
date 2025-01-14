import { PixiParser } from "./PixiParser";
import { program } from "commander";

(() => {
    program
        .usage('[OPTIONS]...')
        .option('-a, --app <value>', 'Set the app name to load the snapshot from.')
        .option('-s, --sample <value>', 'Set the snapshot name to load.')
        .parse(process.argv);

    // read args
    const options = program.opts();
    const appName = options.app;
    const sampleName = options.sample;

    run_parser(appName, sampleName);
})();

function run_parser(appName:string, sampleName:string){
    // todo unhardcode
    const snapshotsPath = `${__dirname}/../../Data/1d-Collecting_Screenshots/screenshots`;
    const inFilePath = `${snapshotsPath}/${appName}/${sampleName}.bzmr`;
    const outFilePath = `${snapshotsPath}/${appName}/${sampleName}.csv`;

    PixiParser.makeTable(inFilePath, outFilePath);
}
