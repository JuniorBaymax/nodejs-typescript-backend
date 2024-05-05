pipeline {
    agent any
    
    environment {
        GITHUB_TOKEN = credentials('Github_Jenkins_AWS')
        CACHE_DIR = '.npm-cache' // Directory to cache npm dependencies
    }
    

    stages {
        stage('Checkout') {
            steps {
                script {
                    checkout scm
                    //  checkout([$class: 'GitSCM', branches: [[name: 'vite-migration']], userRemoteConfigs: [[url: 'https://glpat-SkByuYAoxaDe7qPBJkz-@gitlab.com/project-plantmonitoring/plantmonitoringfrontend.git']]])
                    }
                }
            }
        
        stage('Cache Dependencies') {
            steps {
                script {
                    // Use npm-cache to cache dependencies
                    dir("${CACHE_DIR}") {
                        sh "npm install"
                    }
                    stash includes: "${CACHE_DIR}/**", name: 'npm-cache'
                }
            }
        }
        stage('Setup and Build') {
            steps {
                script {
                     // Unstash npm dependencies
                    unstash 'npm-cache'
                    // Install Node.js and npm
                    tool 'node'
                    def npmCommand = isUnix() ? 'npm' : 'npm.cmd'

                    sh "${npmCommand} install"
                    sh "${npmCommand} run build:dev" // this command is envoirment specific such as DEV/STAGGING/PRDO refer to package.json for available script
                }
            }
        }

        
        stage('Archive Build Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Deploy to Folder') {
            steps {
                script {
                    // Stash the artifacts
                    stash includes: 'build/**', name: 'dist-stash'
                }
            }
        }
        
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        // FOR THE SAME SERVER
        stage('Unstash and Deploy to Folder') {
            steps {
                script {
                    // Unstash the artifacts
                    unstash 'dist-stash'

                    // Move artifacts to the desired folder
                     sh 'mkdir -p /usr/share/nginx/html/plantwatch'
                    //sh 'rm -rf /usr/share/nginx/html/plantwatch/*'
                        sh 'mv build/* /usr/share/nginx/html/plantwatch'
                     // Commit the changes with a message
                    // sh 'git config user.email "jenkins@example.com"'
                    // sh 'git config user.name "Jenkins"'
                    // sh 'git add .'
                    // sh 'git commit -m "Deploy artifacts to custom folder"'
                }
            }
        }
        // stage('Deploy to Remote Server') {
        //    steps {
        //        script {
        //             Unstash the artifacts
        //            unstash 'dist-stash'

        //             Use SSH key to authenticate
        //            sshagent(['imsdevID']) {
        //                 Securely copy artifacts to the remote server
        //                sh "scp -o StrictHostKeyChecking=no -r dist/* ${REMOTE_USERNAME}@${REMOTE_HOST}:${REMOTE_DESTINATION_PATH}"
        //             }
        //         }
        //     }
        // }
        // stage('Deploy to GitHub Pages') {
        //     steps {
        //         script {
        //             // Use GitHub Pages plugin to deploy
        //             publishGhPages(
        //                 credentialsId: 'your-github-token-credential-id',
        //                 repositoryName: 'your-github-repo-name',
        //                 targetRepository: 'your-gh-pages-repo-name',
        //                 publishBranch: 'gh-pages',
        //                 publishDir: 'dist',
        //                 allowEmptyCommit: true
        //             )
        //         }
        //     }
        // }
    }
}

