#!/bin/bash


set -e
##Check if enough arguements are passed
if [ $# -lt 19 ]; then
  echo "Parameters name not provided"
  exit 2
elif [ $# -gt 19 ]; then
  echo "Too many Arguments !!!!"
	echo $#
  exit 2
fi

stackName=$1
volumesize=$2
volumeType=$3
instanceType=$4
imageId=$5
subnetId=$6
keyName=$7
webSecGrpName=$8
webSecGrpDesc=$9

shift
shift
shift
shift
shift
shift
shift
shift
shift

vpcId=$1
rdsSecGrpName=$2
rdsSecGrpDesc=$3
dbHostName=$4
dbUserName=$5
dbPassword=$6
dbDatabaseName=$7
awsBucketName=$8
profileName=$9

shift
shift
shift
shift
shift
shift
shift
shift
shift

ExportStackName=$1


##Creating Stack
echo "Creating Stack $stackName"
aws cloudformation create-stack --stack-name $stackName --template-body file://csye6225-cf-application.yml --parameters ParameterKey=volumesize,ParameterValue=$volumesize ParameterKey=volumeType,ParameterValue=$volumeType ParameterKey=instanceType,ParameterValue=$instanceType ParameterKey=imageId,ParameterValue=$imageId ParameterKey=subnetId,ParameterValue=$subnetId ParameterKey=keyName,ParameterValue=$keyName ParameterKey=webSecGrpName,ParameterValue=$webSecGrpName ParameterKey=webSecGrpDesc,ParameterValue=$webSecGrpDesc ParameterKey=vpcId,ParameterValue=$vpcId ParameterKey=rdsSecGrpName,ParameterValue=$rdsSecGrpName ParameterKey=rdsSecGrpDesc,ParameterValue=$rdsSecGrpDesc ParameterKey=dbHostName,ParameterValue=$dbHostName ParameterKey=dbUserName,ParameterValue=$dbUserName ParameterKey=dbPassword,ParameterValue=$dbPassword ParameterKey=dbDatabaseName,ParameterValue=$dbDatabaseName ParameterKey=awsBucketName,ParameterValue=$awsBucketName ParameterKey=profileName,ParameterValue=$profileName ParameterKey=ExportStackName,ParameterValue=$ExportStackName
echo "Waiting for stack $stackName to be created"
aws cloudformation wait stack-create-complete --stack-name $stackName
echo "stack $1 is created"
