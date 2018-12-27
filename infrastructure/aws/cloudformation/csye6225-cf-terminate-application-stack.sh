#!/bin/bash
read -p "Enter the Application stack name to delete=" stack_name
read -p "Enter the Application stack id to delete=" stack_id
echo "Terminating Application stack : $stack_name"

bucketName=$(aws cloudformation describe-stacks --stack-name $stack_id \
--query 'Stacks[0].Parameters[?ParameterKey==`BucketName`].ParameterValue' \
--output text)

aws s3 rm s3://$bucketName --recursive

aws cloudformation delete-stack --stack-name $stack_id

aws cloudformation wait stack-delete-complete --stack-name $stack_id 

stackId=$(aws cloudformation describe-stacks --stack-name $stack_id \
--query Stacks[0].StackId \
--output text)

if [ -z $stackId ] 
then
echo "APPLICATION STACK TERMINATED SUCCESSFULLY"
fi