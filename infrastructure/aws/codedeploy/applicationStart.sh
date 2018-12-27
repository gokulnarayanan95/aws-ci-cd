#!/bin/bash

cd /home/centos/ec2-user/webapp
sudo npm install pm2 -g
sudo npm install
sudo npm i uuid
sudo npm i -f
sudo pm2 delete index
cd ../../
while IFS=, read a b; do
   echo a: $a b: $b
   export hostname=$a
   export aws_bucket_name=$b
done < out.txt
echo $hostname
cd /home/centos/ec2-user/webapp/
echo -e "$hostname\nprofile=dev\n$aws_bucket_name" > .env
sudo pm2 start index.js -f
