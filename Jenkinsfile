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
                git credentialsId: 'git',
                    url: 'https://github.com/ferosetechie/axe-core.git',
                    branch: 'main'
            }
        }
        stage('Install Java') {
            steps {
                script {
                    // Install Java version compatible with maven-compiler-plugin in pom.xml
                    sh '''
                        JAVA_VERSION=$(grep -oP '<source>\\K[0-9.]+' selenium/pom.xml | head -1)
                        if [ -n "$JAVA_VERSION" ]; then
                            sudo apt-get update
                            sudo apt-get install -y openjdk-${JAVA_VERSION}-jdk
                            export JAVA_HOME=$(update-java-alternatives -l | grep "java-${JAVA_VERSION}-openjdk" | awk '{print $3}')
                            export PATH=$JAVA_HOME/bin:$PATH
                        fi
                    '''
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                script {
                    // Install Node.js dependencies
                    sh 'npm install'
                }
            }
        }
        stage('Install Project Dependencies and Build') {
            steps {
                script {
                    // Go to individual Selenium and Playwright folders and run commands
                    dir('selenium') {
                        sh 'npm start'
                        sh 'mvn clean install'
                    }
                    dir('playwright') {
                        sh 'npm start'
                    }
                    // Run mvn clean install from root folder
                    sh 'mvn clean install'
                }
            }
        }
        stage('Run Accessibility Tests') {
            steps {
                script {
                    // Run the accessibility test script with the target URL, username, and password
                    sh "node run-accessibility-tests.js ${params.TARGET_URL} ${params.USERNAME} ${params.PASSWORD}"
                    
                    // Archive the results file for later analysis
                    archiveArtifacts artifacts: 'accessibility-results.json', allowEmptyArchive: true

                    // Read and log the results for visibility
                    def results = readFile('accessibility-results.json')
                    echo "Accessibility Test Results:\\n${results}"

                    // Generating the accessibility results to a zip
                    sh "zip accessibility-results.zip accessibility-results.json"

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
