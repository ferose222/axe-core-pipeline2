pipeline {
    agent any
    parameters {
        string(name: 'TARGET_URL', defaultValue: 'https://www.deque.com/',
               description: 'The URL to check for accessibility.')
        string(name: 'USERNAME', defaultValue: '',
               description: 'Username for login, leave empty for public URLs.')
        password(name: 'PASSWORD', defaultValue: '',
                 description: 'Password for login, leave empty for public URLs.')
    }
    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'github-credentials',
                    url: 'https://github.com/ferose222/axe-core-pipeline2',
                    branch: 'develop'
            }
        }
        stage('Install Project Dependencies and Build') {
            steps {
                script {
                    // Install Node.js dependencies at the root level
                    sh 'npm install' // Run npm install at the root level
                    
                    // Install http-server locally within the current directory
                    sh 'npm install http-server'
                    
                    // Go to individual Selenium and Playwright folders and run commands
                    dir('selenium') {
                        sh 'npm install' // Install Selenium project dependencies
                        sh './node_modules/.bin/http-server ./node_modules/axe-test-fixtures/fixtures -a "" -p 8001 --silent &' // Start http-server locally in the background
                        sh 'mvn clean install' // Build the selenium project
                    }
                    dir('playwright') {
                        sh 'npm install' // Install Playwright project dependencies
                        sh './node_modules/.bin/http-server ./node_modules/axe-test-fixtures/fixtures -a "" -p $((RANDOM%1000 + 8000)) --silent &' // Start http-server with a random port in the range 8000-8999 in the background
                    }
                    // Run mvn clean install from root folder
                    sh 'mvn clean install' // Build the root Maven project
                }
            }
        }        
        stage('Run Accessibility Tests') {
            steps {
                script {
                    // Run the accessibility test script with the target URL, username, and password
                    sh "set -x; node run-accessibility-tests.js ${params.TARGET_URL} ${params.USERNAME} ${params.PASSWORD}"
                    
                    // Archive the results file for later analysis
                    archiveArtifacts artifacts: 'accessibility-results.json', allowEmptyArchive: true

                    // Read and log the results for visibility
                    def results = readFile('accessibility-results.json')
                    echo "Accessibility Test Results:\n${results}"

                    // Generating the accessibility results to a zip
                    sh "set -x; zip accessibility-results.zip accessibility-results.json"

                    // Archive the compressed results file
                    archiveArtifacts artifacts: 'accessibility-results.zip', allowEmptyArchive: true
                }
            }
        }
    }
    post {
        always {
            echo 'The pipeline has completed.'
        }
    }
}
