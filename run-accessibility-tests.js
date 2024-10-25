const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const AxeBuilder = require('axe-webdriverjs');
const fs = require('fs');

async function runAccessibilityTests(targetUrl) {
    let options = new chrome.Options();
    
    // Add recommended Chrome options for Docker environments
    options.addArguments(
        '--headless',            // Run Chrome in headless mode
        '--no-sandbox',           // Bypass the Chrome sandbox
        '--disable-dev-shm-usage',// Avoid shared memory issues
        '--disable-gpu',          // Disable GPU acceleration
        '--remote-debugging-port=9222', // Ensure Chrome runs with a DevTools port
        '--disable-extensions',   // Avoid issues with extensions
        '--window-size=1920,1080' // Set window size to avoid viewport issues
    );

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log(`Navigating to ${targetUrl}`);
        await driver.get(targetUrl);

        // Inject axe-core into the page
        await driver.executeScript(`
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.0.2/axe.min.js';
            document.head.appendChild(script);
        `);

        console.log("Waiting for axe-core to load...");
        await driver.sleep(3000); // Ensure axe-core has time to load

        console.log("Running accessibility analysis...");
        const results = await AxeBuilder(driver).analyze();

        // Save results to JSON
        fs.writeFileSync('accessibility-results.json', JSON.stringify(results, null, 2));
        console.log("Accessibility results saved to accessibility-results.json");

    } catch (error) {
        console.error("Error running accessibility tests:", error);
    } finally {
        await driver.quit();
    }
}

// Get the URL from command line arguments
const targetUrl = process.argv[2];
if (!targetUrl) {
    console.error("Please provide a target URL.");
    process.exit(1);
}
runAccessibilityTests(targetUrl);
