#!/bin/bash
read -p "Enter the CI/CD stack name to delete=" stack_name
read -p "Enter the CI/CD stack id to delete=" stack_id
echo "Terminating CI/CD stack : $stack_name"

bucketName=$(aws cloudformation describe-stacks --stack-name $stack_id \
--query 'Stacks[0].Parameters[?ParameterKey==`BucketName`].ParameterValue' \
--output text)


webappName=$(aws cloudformation describe-stacks --stack-name $stack_id \
--query 'Stacks[0].Parameters[?ParameterKey==`WebappApplicationName`].ParameterValue' \
--output text)

aws s3 rm s3://$bucketName --recursive

aws deploy delete-deployment-group --application-name $webappName \
--deployment-group-name $webappName

aws deploy delete-application --application-name $webappNameWordPress_DG

aws cloudformation delete-stack --stack-name $stack_id

aws cloudformation wait stack-delete-complete --stack-name $stack_id

stackId=$(aws cloudformation describe-stacks --stack-name $stack_id \
--query Stacks[0].StackId --output text)

if [ -z $stackId ] 
then
echo "CI/CD STACK TERMINATED SUCCESSFULLY"
fi
