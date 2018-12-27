#!/bin/bash

set -e
##Check if enough arguements are passed
if [ $# -lt 4 ]; then
  echo "Parameters name not provided"
  exit 2
elif [ $# -gt 4 ]; then
  echo "Too many Arguments !!!!"
	echo $#
  exit 2
fi

profilename=$1
depGrp=$2
ec2Key=$3
ec2Value=$4
CodeDeployBucket=$5
TravisUser=$6
StorageBucket=$7

##Creating Stack
aws cloudformation create-stack --stack-name "applicationstack" --template-body file://csye6225-cf-cicd.yaml --capabilities CAPABILITY_NAMED_IAM --parameters ParameterKey=profileName,ParameterValue=$profilename ParameterKey=DeploymentGroupName,ParameterValue=$depGrp ParameterKey=EC2Key,ParameterValue=$ec2Key ParameterKey=EC2Value,ParameterValue=$ec2Value ParameterKey=CodeDeployBucket,ParameterValue=$CodeDeployBucket ParameterKey=TravisUser,ParameterValue=$TravisUser ParameterKey=StorageBucket,ParameterValue=$StorageBucket
aws cloudformation wait stack-create-complete --stack-name "applicationstack"
echo "stack is created"
