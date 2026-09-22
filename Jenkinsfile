pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        CI = 'true'
        SCAN_BRANCH = "${env.BRANCH_NAME ?: 'main'}"
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        ANGULAR_DIR = 'angular-client'
        MOBILE_DIR = 'mobile'
        DOCKER_IMAGE_BACKEND = "task-manager-backend:${env.BUILD_NUMBER ?: 'latest'}"
        DOCKER_IMAGE_FRONTEND = "task-manager-frontend:${env.BUILD_NUMBER ?: 'latest'}"
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Initialize & Tooling Verification') {
            steps {
                echo "Initializing Jenkins CI/CD Pipeline for MERN Task Manager..."
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Install Backend Deps') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm ci || npm install'
                        }
                    }
                }
                stage('Install Frontend Deps') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm ci || npm install'
                        }
                    }
                }
                stage('Install Angular Client Deps') {
                    steps {
                        dir("${ANGULAR_DIR}") {
                            sh 'npm ci || npm install'
                        }
                    }
                }
                stage('Install Mobile Deps') {
                    steps {
                        dir("${MOBILE_DIR}") {
                            sh 'npm ci || npm install'
                        }
                    }
                }
            }
        }

        stage('Automated Testing (Jest)') {
            parallel {
                stage('Backend Unit & Integration Tests') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm test'
                        }
                    }
                }
                stage('Frontend React Component Tests') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm test -- --watchAll=false'
                        }
                    }
                }
            }
        }

        stage('Consumer-Driven Contract Testing (PACT)') {
            steps {
                echo "Executing PACT Consumer & Provider Contract Verification..."
                dir("${BACKEND_DIR}") {
                    sh 'npm run test:contract'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'backend/pacts/*.json', allowEmptyArchive: true
                }
            }
        }

        stage('Production Build') {
            parallel {
                stage('Build React Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Angular Client') {
                    steps {
                        dir("${ANGULAR_DIR}") {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Container Image Packaging') {
            steps {
                echo "Building Docker container images for deployment..."
                sh "docker build -t ${DOCKER_IMAGE_BACKEND} ./backend || true"
                sh "docker build -t ${DOCKER_IMAGE_FRONTEND} ./frontend || true"
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline Succeeded: All tests, PACT contracts, and production builds passed."
        }
        failure {
            echo "CI/CD Pipeline Failed. Inspect stage output for details."
        }
    }
}
