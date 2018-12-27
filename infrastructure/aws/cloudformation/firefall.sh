#!/bin/bash

set -e
##Check if enough arguements are passed
if [ $# -lt 2 ]; then
 echo "Parameters name not provided"
 exit 2
elif [ $# -gt 2 ]; then
 echo "Too many Arguments !!!!"
echo $#
 exit 2
fi

autoscalingStack=$1

##Creating Stack
echo "Creating Stack $2"
aws cloudformation create-stack --stack-name $2 --template-body file://owasp_10_base.yml --parameters ParameterKey=autoscalingStack,ParameterValue=$autoscalingStack
aws cloudformation wait stack-create-complete --stack-name $autoscalingStack
echo "Waiting for stack $2 to be created"
aws cloudformation wait stack-create-complete --stack-name $2
echo "stack $2 is created (FIREWALL STACK)"
