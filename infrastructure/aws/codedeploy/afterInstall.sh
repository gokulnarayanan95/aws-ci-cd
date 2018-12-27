#!/bin/bash

# update the permission and ownership of WAR file in the tomcat webapps directory
sudo npm install
cd /opt/aws/amazon-cloudwatch-agent/etc
sudo cp /home/centos/ec2-user/webapp/amazon-cloudwatch-agent-schema.json amazon-cloudwatch-agent-schema.json
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent-schema.json -s

