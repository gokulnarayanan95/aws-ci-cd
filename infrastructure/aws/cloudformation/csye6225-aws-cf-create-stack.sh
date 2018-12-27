#!/bin/bash


set -e
##Check if enough arguements are passed
if [ $# -lt 42 ]; then
  echo "Parameters name not provided"
  exit 2
elif [ $# -gt 42 ]; then
  echo "Too many Arguments !!!!"
	echo $#
  exit 2
fi

vpcCidrBlk=$1
subnet1CidrBlk=$2
subnet2CidrBlk=$3
subnet3CidrBlk=$4
privateSubnet1CidrBlk=$5
privateSubnet2CidrBlk=$6
privateSubnet3CidrBlk=$7
availZone1=$8
availZone2=$9

shift
shift
shift
shift
shift
shift
shift
shift
shift

availZone3=$1
stackName=$2

#CICD PARAMS

profilename=$3
depGrp=$4
ec2Key=$5
ec2Value=$6
CodeDeployBucket=$7
TravisUser=$8
StorageBucket=$9


shift
shift
shift
shift
shift
shift
shift
shift
shift


stackCicd=$1
#APPLICATION PARAMS
APPstackName=$2
volumesize=$3
volumeType=$4
instanceType=$5
imageId=$6
subnetId=$7
keyName=$8
webSecGrpName=$9


shift
shift
shift
shift
shift
shift
shift
shift
shift

webSecGrpDesc=$1
vpcId=$2
rdsSecGrpName=$3
rdsSecGrpDesc=$4
dbHostName=$5
dbUserName=$6
dbPassword=$7
dbDatabaseName=$8
awsBucketName=$9


shift
shift
shift
shift
shift
shift
shift
shift
shift

profileName=$1
ExportStackName=$2

hostID=$(aws route53 list-hosted-zones --query 'HostedZones[0].Id' --output text | cut -d '/' -f 3)
echo "DNS Host ID $hostID"

domainName=$3
certificateARN=$4

#WAFSTACK
autoscalingStack=$5
wafStack=$6


##Creating NETWORK Stack
echo "Creating Stack $stackName"
aws cloudformation create-stack --stack-name $stackName --template-body file://csye6225-cf-networking.yaml --parameters ParameterKey=VPCCidr,ParameterValue=$vpcCidrBlk ParameterKey=Subnet1Cidr,ParameterValue=$subnet1CidrBlk ParameterKey=Subnet2Cidr,ParameterValue=$subnet2CidrBlk ParameterKey=Subnet3Cidr,ParameterValue=$subnet3CidrBlk ParameterKey=PrivateSubnet1Cidr,ParameterValue=$privateSubnet1CidrBlk ParameterKey=PrivateSubnet2Cidr,ParameterValue=$privateSubnet2CidrBlk ParameterKey=PrivateSubnet3Cidr,ParameterValue=$privateSubnet3CidrBlk ParameterKey=AZ1,ParameterValue=$availZone1 ParameterKey=AZ2,ParameterValue=$availZone2 ParameterKey=AZ3,ParameterValue=$availZone3 
aws cloudformation wait stack-create-complete --stack-name $stackName
echo "$stackName Stack is created (NETWORK STACK)"

##Creating CICD Stack
aws cloudformation create-stack --stack-name $stackCicd --template-body file://csye6225-cf-cicd.yaml --capabilities CAPABILITY_NAMED_IAM --parameters ParameterKey=profileName,ParameterValue=$profilename ParameterKey=DeploymentGroupName,ParameterValue=$depGrp ParameterKey=EC2Key,ParameterValue=$ec2Key ParameterKey=EC2Value,ParameterValue=$ec2Value ParameterKey=CodeDeployBucket,ParameterValue=$CodeDeployBucket ParameterKey=TravisUser,ParameterValue=$TravisUser ParameterKey=StorageBucket,ParameterValue=$StorageBucket
echo "Waiting for stack $stackCicd to be created"
aws cloudformation wait stack-create-complete --stack-name $stackCicd 
echo "stack $stackCicd is created (CICD STACK)"



##Creating APPLICATION Stack
echo "Creating Stack $APPstackName"
aws cloudformation create-stack --stack-name $APPstackName --template-body file://test.yml --parameters ParameterKey=volumesize,ParameterValue=$volumesize ParameterKey=volumeType,ParameterValue=$volumeType ParameterKey=instanceType,ParameterValue=$instanceType ParameterKey=imageId,ParameterValue=$imageId ParameterKey=subnetId,ParameterValue=$subnetId ParameterKey=keyName,ParameterValue=$keyName ParameterKey=webSecGrpName,ParameterValue=$webSecGrpName ParameterKey=webSecGrpDesc,ParameterValue=$webSecGrpDesc ParameterKey=vpcId,ParameterValue=$vpcId ParameterKey=rdsSecGrpName,ParameterValue=$rdsSecGrpName ParameterKey=rdsSecGrpDesc,ParameterValue=$rdsSecGrpDesc ParameterKey=dbHostName,ParameterValue=$dbHostName ParameterKey=dbUserName,ParameterValue=$dbUserName ParameterKey=dbPassword,ParameterValue=$dbPassword ParameterKey=dbDatabaseName,ParameterValue=$dbDatabaseName ParameterKey=awsBucketName,ParameterValue=$awsBucketName ParameterKey=profileName,ParameterValue=$profileName ParameterKey=ExportStackName,ParameterValue=$stackName ParameterKey=ZoneID,ParameterValue=$hostID ParameterKey=CertificateARN,ParameterValue=$certificateARN ParameterKey=domainName,ParameterValue=$domainName
echo "Waiting for stack $stackName to be created"
aws cloudformation wait stack-create-complete --stack-name $APPstackName
echo "stack $APPstackName is created (APPLICATION STACK)"

##Creating Stack
echo "Creating Stack $wafStack"
aws cloudformation create-stack --stack-name $wafStack --template-body file://owasp_10_base.yml --parameters ParameterKey=autoscalingStack,ParameterValue=$autoscalingStack
aws cloudformation wait stack-create-complete --stack-name $autoscalingStack
echo "Waiting for stack $2 to be created"
aws cloudformation wait stack-create-complete --stack-name $wafStack
echo "stack $wafStack is created (FIREWALL STACK)"
