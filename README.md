#  NodeJS App Deployment using CI/CD with Jenkins

<p align="center">

![NodeJS](https://img.shields.io/badge/NodeJS-Backend-green?style=for-the-badge&logo=node.js)
![Jenkins](https://img.shields.io/badge/Jenkins-CI/CD-red?style=for-the-badge&logo=jenkins)
![AWS](https://img.shields.io/badge/AWS-EC2-orange?style=for-the-badge&logo=amazon-aws)
![GitHub](https://img.shields.io/badge/GitHub-Webhooks-black?style=for-the-badge&logo=github)
![PM2](https://img.shields.io/badge/PM2-Process_Manager-blue?style=for-the-badge)
![CI/CD](https://img.shields.io/badge/CI-CD_Pipeline-success?style=for-the-badge)

</p>

---

##  Project Overview

This project demonstrates a **complete production-style CI/CD pipeline** to automatically deploy a NodeJS application using Jenkins on AWS EC2.

###  In this setup:

- Jenkins runs on a **Master Server (EC2 instance)**
- Application runs on a **Target Server (EC2 instance)**
- GitHub hosts the source code
- GitHub Webhook triggers Jenkins automatically
- Jenkins Pipeline deploys the application
- PM2 manages the NodeJS process
- Deployment is fully automated

Whenever code is pushed to GitHub, Jenkins automatically deploys the latest version to the target server without manual intervention.

---

#  Architecture

![](./img/Archit%20Image.png)

---

##  CI/CD Workflow

1. Developer pushes code to GitHub  
2. GitHub webhook triggers Jenkins pipeline  
3. Jenkins pulls latest code from GitHub  
4. Jenkins connects to Target Server via SSH  
5. Jenkins uploads latest files  
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

##  1️. Master Server (Jenkins Server)

**Purpose:**
- Run Jenkins
- Execute CI/CD pipeline

**Installed Software:**
- Jenkins
- Java
- Git

---

##  2️. Target Server (Application Server)

**Purpose:**
- Host NodeJS Application

**Installed Software:**
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

 Update System

```bash
sudo apt update
```

 Install Java

```bash
sudo apt install openjdk-17-jdk -y
```

 Install Jenkins

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
/usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
/etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins -y
```

 Start Jenkins

```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

 Access Jenkins

```
http://<MASTER_SERVER_IP>:8080
```

---

#  Step 2: Install NodeJS and PM2 on Target Server

 Connect to Target Server

```bash
ssh -i key.pem ubuntu@<TARGET_SERVER_IP>
```

 Install NodeJS & PM2

```bash
sudo apt update
sudo apt install nodejs -y
sudo npm install -g pm2
```

 Verify Installation

```bash
node -v
npm -v
pm2 -v
```
![](./img/Screenshot%202026-02-21%20160036.png)

---

#  Step 3: Create Jenkins Pipeline Job

- Open Jenkins Dashboard  
- Click **New Item**  
- Name: `NodeJS-app-CICD-deployment`  
- Select **Pipeline**  
- Click **OK**

---

#  Step 4: Configure GitHub Repository in Jenkins

 Enable:

```
GitHub hook trigger for GITScm polling
```

 Select:

```
Pipeline script from SCM
Git
```

 Repository URL

```
https://github.com/aftab0045/NodeJS-app-CICD-deployment.git
```

 Branch

```
main
```
![](./img/Screenshot%202026-02-21%20155821.png)

---

#  Step 5: Add SSH Credentials in Jenkins

Navigate to:

```
Manage Jenkins → Credentials → Global → Add Credentials
```

 Select:

**Kind:**
```
SSH Username with private key
```

**ID:**
```
node-app-key
```

---

#  Step 6: Add Jenkinsfile

Add your existing `Jenkinsfile` inside the GitHub repository.

![](./img/Screenshot%202026-02-21%20160008.png)

---

#  Step 7: Configure GitHub Webhook

 Payload URL

```
http://<JENKINS_SERVER_IP>:8080/github-webhook/
```

 Content Type

```
application/json
```

 Event

```
Just the push event
```
![](./img/Screenshot%202026-02-21%20160233.png)

---

#  Step 8: Deploy Application

Push code to GitHub:

```bash
git add .
git commit -m "update"
git push origin main
```

Jenkins automatically starts deployment.

![](./img/Screenshot%202026-02-21%20160008.png)

---

#  Step 9: Verify Successful Build in Jenkins

After pushing the code:

- Open Jenkins Dashboard  
- Click your pipeline job  
- Open **Build History**  
- Click latest build number  
- Open **Console Output**

You should see:

```
Application deployed successfully
Finished: SUCCESS
```
![](./img/Screenshot%202026-02-21%20155836.png) 

 This confirms:

- Jenkins pipeline executed correctly  
- Deployment completed without errors  
- Target server received updated code  

---

#  Step 10: Access Application

Open browser:

```
http://<TARGET_SERVER_IP>:3000
```
![](./img/Screenshot%202026-02-21%20155849.png)

---

#  Step 11: Verify GitHub Webhook Delivery

Go to:

```
GitHub → Settings → Webhooks → Recent Deliveries
```

You should see:

- Status Code: 200  
- Last delivery was successful  

![](./img/Screenshot%202026-02-21%20160513.png)

---

#  Step 12: Update Code & Test Automatic Deployment

Modify `app.js`

Push changes:

```bash
git add .
git commit -m "Updated application"
git push origin main
```
![](./img/Screenshot%202026-02-21%20160450.png)

Jenkins automatically:

- Pulls new code  
- Deploys to server  
- Restarts PM2  
- Makes app live  

![](./img/Screenshot%202026-02-21%20160608.png)

![](./img/Screenshot%202026-02-21%20155908.png) 

![](./img/Screenshot%202026-02-21%20160553.png)

---

#  Project Structure

```
NodeJS-app-CICD-deployment/
│
├── app.js
├── package.json
├── Jenkinsfile
├── README.md
└── screenshots/
```



---

#  Conclusion

This project demonstrates a real-world CI/CD pipeline used in production environments. By integrating GitHub, Jenkins, and AWS EC2 with secure SSH-based deployment, the entire release process is fully automated.

This eliminates manual deployment, reduces human error, improves release speed, and follows industry-standard DevOps best practices.

It provides a strong foundation for scaling toward containerized and cloud-native deployments.