FROM custom-axe-core:1.1

WORKDIR /workspace

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including selenium-webdriver and axe-webdriverjs
RUN npm install && \
    npm install selenium-webdriver axe-webdriverjs

# Install http-server globally (if needed)
RUN npm install -g http-server

# Add the Google Chrome repository and install Chrome + ChromeDriver
RUN apt-get update && \
    apt-get install -y wget gnupg --no-install-recommends && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable chromium-driver --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Ensure /dev/shm is properly configured
RUN mkdir -p /dev/shm && chmod 1777 /dev/shm

# Copy the rest of the application
COPY . .

# Expose port 3000 (if needed)
EXPOSE 3000

# Default command to run the accessibility tests
CMD ["node", "run-accessibility-tests.js"]
