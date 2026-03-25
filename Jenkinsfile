pipeline {
  agent any
  environment {
    DOCKER_IMAGE = 'ritik2909/sample-app'
    DOCKER_TAG   = "${BUILD_NUMBER}"
    EC2_HOST     = 'ubuntu@13.201.119.240'
  }

  stages {
    stage('Checkout') {
      steps {
        echo 'Pulling source code from GitHub...'
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        echo 'Building Docker image...'
        sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
        sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest'
      }
    }

    stage('Run Tests') {
      steps {
        echo 'Running tests inside container...'
        sh '''
          docker run --rm \
            -v $(pwd)/app:/app \
            -w /app node:18-alpine \
            sh -c "npm install && npm test"
        '''
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'ritik2909',
          passwordVariable: 'Ritik@2909'
        )]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
          sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG}'
          sh 'docker push ${DOCKER_IMAGE}:latest'
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        sshagent(['ec2-ssh-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ${EC2_HOST} "
              docker pull ${DOCKER_IMAGE}:latest
              docker stop sample-app || true
              docker rm   sample-app || true
              docker run -d -p 80:3000 \
                --name sample-app \
                --restart always \
                ${DOCKER_IMAGE}:latest
            "
          '''
        }
      }
    }
  }

  post {
    success { echo 'Pipeline succeeded! App deployed.' }
    failure { echo 'Pipeline failed. Check logs above.' }
    always  {
      sh 'docker logout || true'
      sh 'docker image prune -f || true'
    }
  }
}
