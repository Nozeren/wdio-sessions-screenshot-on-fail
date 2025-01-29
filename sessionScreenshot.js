const fs = require('fs');
const event = require('codeceptjs').event
const container = require('codeceptjs').container
const recorder = require('codeceptjs').recorder
const { output } = require("codeceptjs/lib");

const helper = container.helpers()['WebDriver'];
const dataType = 'image/png'

function filePath(fileName){
    let outputFile = `${global.output_dir}/${fileName}`
    outputFile = outputFile.replace(/ /g, '_')
    return outputFile;
}

module.exports = function() {
    event.dispatcher.on(event.test.failed, async (test, err) => {
        let outputFile;
        let attachementTitle
        let fullPath
        recorder.add(
            'screenshot all sessions of failed test',
            async () => {
                const allure = container.plugins("allure");
                if (!test.artifacts) test.artifacts = {}
                
                if (helper.activeSessionName || helper.sessionWindows) {
                    for (const sessionName in helper.sessionWindows){
                        const activeSession = helper.sessionWindows[sessionName];
                        outputFile = filePath(`${sessionName}_${test.title}.failed.png`);
                        output.plugin(`${sessionName} - Screenshot is saving to ${outputFile}`)
                        if (activeSession) {
                            await activeSession.saveScreenshot(outputFile)
                            output.plugin(`Screenshot of ${sessionName} session has been saved to ${outputFile}.`)
                            test.artifacts[`${sessionName.replace(/ /g, '_')}_screenshot`] =  outputFile;
                            attachementTitle = `${sessionName} - Last Seen Screenshot`;
                            fullPath = fs.readFileSync(outputFile);
                            await allure.addAttachment(attachementTitle,fullPath, dataType);
                            output.plugin(`Screenshot ${outputFile} has been attached to the allure report.`);
                        }
                    }
                }
                outputFile = filePath(`${test.title}.failed.png`);
                await helper.browser.saveScreenshot(outputFile)
                output.plugin(`Screenshot has been saved to ${outputFile}`)
                test.artifacts.screenshot = outputFile;
                attachementTitle = `Main session - Last Seen Screenshot`;
                fullPath = fs.readFileSync(outputFile);
                await allure.addAttachment(attachementTitle,fullPath, dataType);
                output.plugin(`Screenshot ${outputFile} has been attached to the allure report.`);
            })}
    )
}
