

pipeline {
    agent any

    // ---- Change these 2 values to your own ----
    environment {
        DOCKERHUB_USER        = 'ritik2909'         
        IMAGE_NAME            = "${DOCKERHUB_USER}/sample-app"
        IMAGE_TAG             = "${BUILD_NUMBER}"                  
        EC2_HOST              = '13.126.2.60'              
        EC2_USER              = 'ubuntu'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')    
    }

    stages {

        // ---- STAGE 1: Pull latest code from GitHub ----
        stage('Checkout') {
            steps {
                echo "=== STAGE 1: Checkout code from GitHub ==="
                checkout scm
            }
        }

        // ---- STAGE 2: Build Docker image ----
        stage('Build Docker Image') {
            steps {
                echo "=== STAGE 2: Building Docker image ==="
                script {
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                    sh "docker tag  ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
                    echo "Image built: ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        // ---- STAGE 3: Run tests inside container ----
        stage('Test') {
            steps {
                echo "=== STAGE 3: Running tests ==="
                script {
                    sh """
                        docker run --rm \
                          -e NODE_ENV=test \
                          ${IMAGE_NAME}:${IMAGE_TAG} \
                          sh -c "npm install && npm test"
                    """
                }
            }
        }

        // ---- STAGE 4: Push image to Docker Hub ----
        stage('Push to Docker Hub') {
            steps {
                echo "=== STAGE 4: Pushing image to Docker Hub ==="
                script {
                    sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                    echo "Pushed: ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        // ---- STAGE 5: Deploy to EC2 ----
        stage('Deploy to EC2') {
            steps {
                echo "=== STAGE 5: Deploying to EC2 ==="
                sshagent(['ec2-ssh-key']) {                         
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            echo "Pulling latest image..."
                            docker pull ${IMAGE_NAME}:latest

                            echo "Stopping old container..."
                            docker stop sample-app 2>/dev/null || true
                            docker rm   sample-app 2>/dev/null || true

                            echo "Starting new container..."
                            docker run -d \
                              --name sample-app \
                              -p 80:3000 \
                              --restart always \
                              -e NODE_ENV=production \
                              ${IMAGE_NAME}:latest

                            echo "Deployment done. Container status:"
                            docker ps | grep sample-app
                        '
                    """
                }
            }
        }

    } // end stages

    // ---- Post-build actions ----
    post {
        success {
            echo "SUCCESS: Pipeline finished. App live at http://${EC2_HOST}"
        }
        failure {
            echo "FAILED: Check the logs above for errors."
        }
        always {
            sh "docker logout || true"
            sh "docker image prune -f || true"
        }
    }

} // end pipeline
