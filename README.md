# csye6225-fall2018

Repository for Network structures and Cloud Computing!

# Collaborators
1. Gokul Anantha Narayanan - ananthanarayanan.g
2. Aashrith - chilkepalli.a.
3. Ananda ganesh - balasubramanian.aah
4. Krupashankar - sundararajan.k

# Prerequisites
1. POSTMAN 
2. AWS CLI
3. GIT
4. Travis CI

# Deployment
1. Clone the repository. Change directory into the infrastructure and run the stacks command . Three stacks would be created namely Network Stack, CICD Stack and Application Stack. 
2. Then commiting anything into git would trigger a build monitored by travis ci and would zip our git repo and place the contents into an s3 bucket . 
3. Code deploy would then take the contents in the S3 bucket and place it in the ec2 instances where our web app would live.
4. A load balancer entry would be added into the route 53 DNS Configuration automatically which would front the web application.
5. Any requests made to our web domain would be handled by the loadbalancer and the number of instances would automatically scale up based on the number of requests.

# Builds and Release
1. Travis CI can be <a href = 'https://travis-ci.com/AashrithChilkepalli'>Here</a>
2. Releases are made for each assignment.
