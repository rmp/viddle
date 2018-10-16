const MSICreator = require('electron-wix-msi').MSICreator;

async function start () {
    // Step 1: Instantiate the MSICreator
    const msiCreator = new MSICreator({
	appDirectory: "The Amazing Video Fetcher-win32-x64",
	description: 'The Amazing Video Fetcher',
	exe: 'TAVF Installer', // both target installer exe and installed shortcut target. doh.
	name: 'The Amazing Video Fetcher',
	manufacturer: 'PsyPhi Network',
	version: '1.0.0',
	outputDirectory: '.',
	upgradeCode: '63D780FC-73B2-4F90-AFD6-5C77895F32CC',
	arch: 'x64'
    });
    
    // Step 2: Create a .wxs template file
    await msiCreator.create();
    
    // Step 3: Compile the template to a .msi file
    await msiCreator.compile();
}

start();