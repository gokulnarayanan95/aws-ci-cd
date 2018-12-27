#!/bin/bash


set -e
##Check if enough arguements are passed
if [ $# -lt 1 ]; then
  echo 1>&2 "$0: Stack name not provided"
  exit 2
elif [ $# -gt 2 ]; then
  echo 1>&2 "$0: Too many Arguments"
  exit 2
fi

echo "Deleting Stack $1"
aws cloudformation delete-stack --stack-name $1
aws cloudformation wait stack-delete-complete --stack-name $1
echo "Stack $1 deleted!"
