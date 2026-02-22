#  NodeJS App Deployment using CI/CD with Jenkins

##  Project Overview

This project demonstrates how to deploy a NodeJS application automatically using a CI/CD pipeline with Jenkins.

In this setup:

- Jenkins runs on a **Master Server (EC2 instance)**
- Application runs on a **Target Server (EC2 instance)**
- **GitHub** is used as the source code repository
- **Jenkins Pipeline** automates deployment
- **GitHub Webhook** triggers Jenkins automatically on code push
- **PM2** is used to run and manage the NodeJS application

Whenever code is pushed to GitHub, Jenkins automatically deploys the latest code to the target server without manual intervention.


#  Architecture
![](./img/Archit%20Image.png)
## Workflow

1. Developer pushes code to GitHub
2. GitHub webhook triggers Jenkins pipeline
3. Jenkins pulls latest code from GitHub
4. Jenkins connects to Target Server via SSH
5. Jenkins uploads latest files to Target Server
6. Jenkins installs dependencies using npm
7. Jenkins starts application using PM2
8. Application becomes live on Target Server

---

#  Technologies Used

- NodeJS
- Jenkins
- GitHub
- AWS EC2
- PM2
- SSH
- Linux (Ubuntu)
- Git
- CI/CD Pipeline

---

#  AWS Infrastructure Setup

Two EC2 Instances were created:

## 1️ Master Server (Jenkins Server)

Purpose:
- Run Jenkins
- Execute CI/CD pipeline

Installed Software:
- Jenkins
- Java
- Git

## 2️ Target Server (Application Server)

Purpose:
- Host NodeJS Application

Installed Software:
- NodeJS
- npm
- PM2

![](./img/Screenshot%202026-02-21%20155941.png)


---

#  Step 1: Install Jenkins on Master Server

Connect to Master Server:

```bash
ssh -i key.pem ubuntu@<MASTER_SERVER_IP>
```
Update system:
```
sudo apt update
```
Install Java:
```
sudo apt install openjdk-17-jdk -y
```
Install Jenkins:
```
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
/usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
/etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins -y
```
Start Jenkins:
```
sudo systemctl start jenkins
sudo systemctl enable jenkins
```
Access Jenkins:
```
http://<MASTER_SERVER_IP>:8080
```
![](./img/Screenshot%202026-02-21%20155821.png)

---

# Step 2: Install NodeJS and PM2 on Target Server

Connect to Target Server:
```
ssh -i key.pem ubuntu@<TARGET_SERVER_IP>
```
Install NodeJS:
```
sudo apt update
sudo apt install nodejs -y
```
Install PM2:
```
sudo npm install -g pm2
```
Verify installation:
```
node -v
npm -v
pm2 -v
```
![](./img/Screenshot%202026-02-21%20160036.png)


# Step 3: Create Jenkins Pipeline Job

Steps:

- Open Jenkins Dashboard

- Click New Item

- Enter Name: NodeJS-app-CICD-deployment

- Select: Pipeline

- Click OK


# Step 4: Configure GitHub Repository in Jenkins

Enable:
```
GitHub hook trigger for GITScm polling
```
Under Pipeline:

Select:
```
Pipeline script from SCM
```
SCM:
```
Git
```
Repository URL:
```
https://github.com/aftab0045/NodeJS-app-CICD-deployment.git
```
Branch:
```
main
```
![](./img/Screenshot%202026-02-21%20155821.png)

# Step 5: Add SSH Credentials in Jenkins

Steps:

Manage Jenkins → Credentials → Global → Add Credentials

Select:

Kind:
```
SSH Username with private key
```
Username:
```
ubuntu
```
Private Key:
```
Paste your EC2 private key
```
ID:
```
node-app-key
```

# Step 6: Jenkinsfile Configuration
```
pipeline {
    agent any

    environment {
        SERVER_IP      = 'YOUR_TARGET_SERVER_IP'
        SSH_CREDENTIAL = 'node-app-key'
        REPO_URL       = 'https://github.com/aftab0045/NodeJS-app-CICD-deployment.git'
        BRANCH         = 'main'
        REMOTE_USER    = 'ubuntu'
        REMOTE_PATH    = '/home/ubuntu/node-app'
    }
    
    stages {

        stage('Clone Repository') {
            steps {
                git branch: "${BRANCH}", url: "${REPO_URL}"
            }
        }

        stage('Upload Files to target-server') {
            steps {
                sshagent([SSH_CREDENTIAL]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${SERVER_IP} 'mkdir -p ${REMOTE_PATH}'
                        scp -o StrictHostKeyChecking=no -r * ${REMOTE_USER}@${SERVER_IP}:${REMOTE_PATH}/
                    """
                }
            }
        }

        stage('Install Dependencies & Start App') {
            steps {
                sshagent([SSH_CREDENTIAL]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${SERVER_IP} '
                            cd ${REMOTE_PATH} &&
                            npm install &&
                            pm2 start app.js --name node-app || pm2 restart node-app
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Application deployed successfully'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}
```
![](./img/Screenshot%202026-02-21%20160008.png)


# Step 7: Configure GitHub Webhook

Go to GitHub Repository:

Settings → Webhooks → Add Webhook

Payload URL:
```
http://<JENKINS_SERVER_IP>:8080/github-webhook/
```
Content type:
```
application/json
```
Select:
```
Just the push event
```
Click:
```
Add Webhook
```
![](./img/Screenshot%202026-02-21%20160233.png)

# Step 8: Deploy Application

Push code to GitHub:
```
git add .
git commit -m "update"
git push origin main
```
Jenkins automatically deploys application.

![](./img/Screenshot%202026-02-21%20160008.png)

# Step 9: Access Application

Open browser:
```
http://<TARGET_SERVER_IP>:3000
```

![](./img/Screenshot%202026-02-21%20155836.png)

![](./img/Screenshot%202026-02-21%20155849.png)

---

#  Step 10: Verify GitHub Webhook Delivery

After pushing code to GitHub, it is important to verify that the webhook triggered successfully.

### Steps to Check Webhook Status:

1. Go to your GitHub Repository
2. Click **Settings**
3. Click **Webhooks**
4. Select your configured webhook
5. Open the **Recent Deliveries** section

You should see:

✅ **Status Code: 200**  
✅ **Last delivery was successful**

If the webhook is successful:
- Jenkins pipeline will automatically start
- You will see a new build triggered in Jenkins dashboard

![](./img/Screenshot%202026-02-21%20160513.png)


---

#  Step 11: Update Code Locally & Automatic Deployment

To test full CI/CD automation:

### 1️. Make Changes Locally

Modify any file (for example `app.js`):

### 2. Push Code to GitHub
```
git add .
git commit -m "Updated application"
git push origin main
```
![](./img/Screenshot%202026-02-21%20160450.png)

### 3. Automatic CI/CD Execution

Once code is pushed:

 - GitHub triggers webhook

 - Jenkins pipeline starts automatically

 - Jenkins pulls latest code

 - Jenkins deploys code to target server

 - PM2 restarts the application

 - Updated application goes live

No manual deployment required

### 4. Verify Updated Application

You will see the updated changes reflected immediately.

![](./img/Screenshot%202026-02-21%20160608.png)

![](./img/Screenshot%202026-02-21%20155908.png)

![](./img/Screenshot%202026-02-21%20160553.png)

# Project Structure
```
NodeJS-app-CICD-deployment/
│
├── app.js
├── package.json
├── Jenkinsfile
├── README.md
└── screenshots/
```

#  Conclusion

This project successfully demonstrates the implementation of a complete CI/CD pipeline for automated deployment of a NodeJS application using Jenkins, GitHub, and AWS EC2. By integrating GitHub with Jenkins through webhooks and configuring secure SSH-based deployment, the entire process from code commit to production deployment has been fully automated.

The Jenkins Master server efficiently pulls the latest code from the GitHub repository, transfers it to the target server, installs required dependencies, and manages the application using PM2. This eliminates the need for manual deployment, reduces human errors, and ensures faster and more reliable releases.

Through this project, I gained practical hands-on experience with Jenkins pipelines, GitHub webhook integration, remote server deployment, process management using PM2, and real-world CI/CD workflows used in production environments.

This setup reflects industry-standard DevOps practices and provides a strong foundation for implementing advanced deployment strategies using tools like Docker, Kubernetes, and cloud-native CI/CD solutions in the future.







