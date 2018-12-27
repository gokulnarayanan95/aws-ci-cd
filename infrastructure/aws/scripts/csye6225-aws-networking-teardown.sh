set -e


vpcname=$1
#Get a vpc-Id using the name provided
vpcId=`aws ec2 describe-vpcs --filter "Name=tag:Name,Values=${vpcname}-csye6225-vpc" --query 'Vpcs[*].{id:VpcId}' --output text`
#Get a Internet Gateway Id using the name provided
gatewayId=`aws ec2 describe-internet-gateways --filter "Name=tag:Name,Values=${vpcname}-csye6225-InternetGateway" --query 'InternetGateways[*].{id:InternetGatewayId}' --output text`
#Get a route table Id using the name provided
routeTableId=`aws ec2 describe-route-tables --filter "Name=tag:Name,Values=${vpcname}-csye6225-public-route-table" --query 'RouteTables[*].{id:RouteTableId}' --output text`

#Delete the route
aws ec2 delete-route --route-table-id $routeTableId --destination-cidr-block 0.0.0.0/0
if [ $? -eq 0 ]; then
  echo "Deleting the route..."
else
   echo "Deleting route Failed"
fi


 VPC_SUBNETS=$(aws ec2 describe-subnets --query "Subnets[?VpcId=='$vpcId'].[SubnetId][]" --output text)
    echo '>>>' $VPC_SUBNETS 'subnets found'

    for SUBNET_ID in $VPC_SUBNETS
    do
        echo '>>> deleting' $SUBNET_ID
     
        aws ec2 delete-subnet --subnet-id "$SUBNET_ID"

    done
    

#Delete the route table
aws ec2 delete-route-table --route-table-id $routeTableId
if [ $? -eq 0 ]; then
  echo "Deleting the route table-> route table id: "$routeTableId
else
   echo "Deleting ROUTE Table Failed"
fi


#Detach Internet gateway and vpc
aws ec2 detach-internet-gateway --internet-gateway-id $gatewayId --vpc-id $vpcId
if [ $? -eq 0 ]; then
   echo "Detaching Internet Gateway Associated from vpc..."
else
   echo "Detaching InternetGateway Failed"
fi


#Delete the Internet gateway
aws ec2 delete-internet-gateway --internet-gateway-id $gatewayId
if [ $? -eq 0 ]; then
  echo "Deleting the Internet gateway-> gateway id: "$gatewayId
else
   echo "Deleting InternetGateway Failed"
fi


#Delete the vpc
aws ec2 delete-vpc --vpc-id $vpcId
if [ $? -eq 0 ]; then
   echo "Deleting the vpc-> vpc id: "$vpcId
else
   echo "Deleting VPC Failed"
fi



echo "Job done!"
