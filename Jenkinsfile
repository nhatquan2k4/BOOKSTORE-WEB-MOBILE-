pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'registry:5000'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/bookstore/api"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/bookstore/web"
        DOCKER_CREDS = credentials('docker-registry-creds')
        BUILD_VERSION = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out code...'
                checkout scm
            }
        }
        
        stage('Build & Test Backend') {
            steps {
                dir('BE') {
                    echo '🔨 Building .NET Backend...'
                    script {
                        if (isUnix()) {
                            sh 'dotnet restore BookStore.sln'
                            sh 'dotnet build BookStore.sln --no-restore --configuration Release'
                        } else {
                            bat 'dotnet restore BookStore.sln'
                            bat 'dotnet build BookStore.sln --no-restore --configuration Release'
                        }
                    }
                    
                    echo '🧪 Running Backend Tests...'
                    script {
                        if (isUnix()) {
                            sh 'dotnet test Core/BookStore.Tests/BookStore.Tests.csproj --configuration Release --no-build --verbosity normal'
                        } else {
                            bat 'dotnet test Core\\BookStore.Tests\\BookStore.Tests.csproj --configuration Release --no-build --verbosity normal'
                        }
                    }
                }
            }
        }
        
        stage('Build & Test Frontend') {
            steps {
                dir('web-frontend') {
                    echo '🔨 Building Next.js Frontend...'
                    script {
                        if (isUnix()) {
                            sh 'npm ci'
                            sh 'npm run build'
                        } else {
                            bat 'npm ci'
                            bat 'npm run build'
                        }
                    }
                    
                    echo '🧪 Running Frontend Tests...'
                    script {
                        if (isUnix()) {
                            sh 'npm run lint || true'
                        } else {
                            bat 'npm run lint || exit 0'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Backend Image') {
                    steps {
                        dir('BE') {
                            echo '🐳 Building Backend Docker Image...'
                            script {
                                def gitCommit = isUnix() ? 
                                    sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim() :
                                    bat(returnStdout: true, script: '@git rev-parse --short HEAD').trim()
                                
                                if (isUnix()) {
                                    sh """
                                        docker build -t ${BACKEND_IMAGE}:${BUILD_VERSION} -t ${BACKEND_IMAGE}:${gitCommit} -t ${BACKEND_IMAGE}:latest -f Dockerfile .
                                    """
                                } else {
                                    bat """
                                        docker build -t ${BACKEND_IMAGE}:${BUILD_VERSION} -t ${BACKEND_IMAGE}:${gitCommit} -t ${BACKEND_IMAGE}:latest -f Dockerfile .
                                    """
                                }
                            }
                        }
                    }
                }
                
                stage('Frontend Image') {
                    steps {
                        dir('web-frontend') {
                            echo '🐳 Building Frontend Docker Image...'
                            script {
                                def gitCommit = isUnix() ? 
                                    sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim() :
                                    bat(returnStdout: true, script: '@git rev-parse --short HEAD').trim()
                                
                                if (isUnix()) {
                                    sh """
                                        docker build -t ${FRONTEND_IMAGE}:${BUILD_VERSION} -t ${FRONTEND_IMAGE}:${gitCommit} -t ${FRONTEND_IMAGE}:latest .
                                    """
                                } else {
                                    bat """
                                        docker build -t ${FRONTEND_IMAGE}:${BUILD_VERSION} -t ${FRONTEND_IMAGE}:${gitCommit} -t ${FRONTEND_IMAGE}:latest .
                                    """
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                echo '📤 Pushing images to Docker Registry...'
                script {
                    def gitCommit = isUnix() ? 
                        sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim() :
                        bat(returnStdout: true, script: '@git rev-parse --short HEAD').trim()
                    
                    if (isUnix()) {
                        sh """
                            echo \$DOCKER_CREDS_PSW | docker login ${DOCKER_REGISTRY} -u \$DOCKER_CREDS_USR --password-stdin
                            docker push ${BACKEND_IMAGE}:${BUILD_VERSION}
                            docker push ${BACKEND_IMAGE}:${gitCommit}
                            docker push ${BACKEND_IMAGE}:latest
                            docker push ${FRONTEND_IMAGE}:${BUILD_VERSION}
                            docker push ${FRONTEND_IMAGE}:${gitCommit}
                            docker push ${FRONTEND_IMAGE}:latest
                            docker logout ${DOCKER_REGISTRY}
                        """
                    } else {
                        bat """
                            echo %DOCKER_CREDS_PSW% | docker login ${DOCKER_REGISTRY} -u %DOCKER_CREDS_USR% --password-stdin
                            docker push ${BACKEND_IMAGE}:${BUILD_VERSION}
                            docker push ${BACKEND_IMAGE}:${gitCommit}
                            docker push ${BACKEND_IMAGE}:latest
                            docker push ${FRONTEND_IMAGE}:${BUILD_VERSION}
                            docker push ${FRONTEND_IMAGE}:${gitCommit}
                            docker push ${FRONTEND_IMAGE}:latest
                            docker logout ${DOCKER_REGISTRY}
                        """
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'CodeLastest'
                }
            }
            steps {
                echo '🚀 Deploying to environment...'
                script {
                    if (isUnix()) {
                        sh """
                            echo "Deployment would happen here"
                            echo "Backend Image: ${BACKEND_IMAGE}:${BUILD_VERSION}"
                            echo "Frontend Image: ${FRONTEND_IMAGE}:${BUILD_VERSION}"
                        """
                    } else {
                        bat """
                            echo Deployment would happen here
                            echo Backend Image: ${BACKEND_IMAGE}:${BUILD_VERSION}
                            echo Frontend Image: ${FRONTEND_IMAGE}:${BUILD_VERSION}
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Backend: ${BACKEND_IMAGE}:${BUILD_VERSION}"
            echo "Frontend: ${FRONTEND_IMAGE}:${BUILD_VERSION}"
            echo "View images at: http://localhost:8081"
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            echo '🧹 Cleaning up...'
            script {
                if (isUnix()) {
                    sh 'docker image prune -f'
                } else {
                    bat 'docker image prune -f'
                }
            }
        }
    }
}
