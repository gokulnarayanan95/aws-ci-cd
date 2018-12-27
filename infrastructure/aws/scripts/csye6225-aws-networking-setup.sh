set -e

##Check if enough arguements are passed
if [ $# -lt 10 ]; then
  echo "Parameters name not provided"
  exit 2
elif [ $# -gt 10 ]; then
  echo "Too many Arguments !!!!"
	echo $#
  exit 2
fi

SUBNET_PRIVATE_AZ="us-east-1a"

vpcname=$1
cidrsubnet_1=$2
cidrsubnet_2=$3
cidrsubnet_3=$4
cidrsubnet_4=$5
cidrsubnet_5=$6
cidrsubnet_6=$7
availabilityz1=$8
availabilityz2=$9
shift
shift
shift
shift
shift
shift
shift
shift
shift

availabilityz3=$1


#Create VPC and get its Id
vpcId=`aws ec2 create-vpc --cidr-block 172.31.0.0/16 --query 'Vpc.VpcId' --output text`
#Tag vpc
aws ec2 create-tags --resources $vpcId --tags Key=Name,Value=$vpcname-csye6225-vpc
echo "Vpc created-> Vpc Id:  "$vpcId

#Create Subnets
subnetId=`aws ec2 create-subnet --vpc-id $vpcId --cidr-block $cidrsubnet_1 --availability-zone $availabilityz1 --query 'Subnet.SubnetId' --output text --region us-east-1`

#tag Subnets
aws ec2 create-tags --resources $subnetId --tags Key=Name,Value=$vpcname-csye6225-subnet
echo "Subnets created-> SubnetID: "$subnetId

#enable public ip on subnet
modify_response=$(aws ec2 modify-subnet-attribute \
 --subnet-id "$subnetId" \
 --map-public-ip-on-launch)


subnetId_2=`aws ec2 create-subnet --vpc-id $vpcId --cidr-block $cidrsubnet_2 --availability-zone $availabilityz2 --query 'Subnet.SubnetId' --output text --region us-east-1`

#tag Subnets
aws ec2 create-tags --resources $subnetId_2 --tags Key=Name,Value=$vpcname-csye6225-subnet2
echo "Subnets created-> SubnetID: "$subnetId_2

#enable public ip on subnet
modify_response=$(aws ec2 modify-subnet-attribute \
 --subnet-id "$subnetId_2" \
 --map-public-ip-on-launch)




subnetId_3=`aws ec2 create-subnet --vpc-id $vpcId --cidr-block $cidrsubnet_3 --availability-zone $availabilityz3 --query 'Subnet.SubnetId' --output text --region us-east-1`

#tag Subnets
aws ec2 create-tags --resources $subnetId_3 --tags Key=Name,Value=$vpcname-csye6225-subnet3
echo "Subnets created-> SubnetID: "$subnetId_3

#enable public ip on subnet
modify_response=$(aws ec2 modify-subnet-attribute \
 --subnet-id "$subnetId_3" \
 --map-public-ip-on-launch)






# Create Private Subnet

subnet_private_Id=`aws ec2 create-subnet --vpc-id $vpcId --cidr-block $cidrsubnet_4 --availability-zone $availabilityz1 --query 'Subnet.SubnetId' --output text --region us-east-1`

#Tag private Subnet
aws ec2 create-tags --resources $subnet_private_Id --tags Key=Name,Value=$vpcname-csye6225-private-subnet
echo "Private Subnets created-> SubnetID: "$subnet_private_Id


# Create Private Subnet

subnet_private_Id2=`aws ec2 create-subnet --vpc-id $vpcId --cidr-block $cidrsubnet_5 --availability-zone $availabilityz2 --query 'Subnet.SubnetId' --output text --region us-east-1`

#Tag private Subnet
aws ec2 create-tags --resources $subnet_private_Id2 --tags Key=Name,Value=$vpcname-csye6225-private-subnet2
echo "Private Subnets created-> SubnetID: "$subnet_private_Id2



# Create Private Subnet

subnet_private_Id3=`aws ec2 create-subnet --vpc-id $vpcId --cidr-block $cidrsubnet_6 --availability-zone $availabilityz3 --query 'Subnet.SubnetId' --output text --region us-east-1`

#Tag private Subnet
aws ec2 create-tags --resources $subnet_private_Id3 --tags Key=Name,Value=$vpcname-csye6225-private-subnet3
echo "Private Subnets created-> SubnetID: "$subnet_private_Id3





#Create Internet Gateway
gatewayId=`aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text`
#Tag Internet Gateway
aws ec2 create-tags --resources $gatewayId --tags Key=Name,Value=$vpcname-csye6225-InternetGateway
echo "Internet gateway created-> gateway Id: "$gatewayId

#Attach Internet Gateway to Vpc
aws ec2 attach-internet-gateway --internet-gateway-id $gatewayId --vpc-id $vpcId
echo "Attached Internet gateway: "$gatewayId" to Vpc: "$vpcId

#Create Route Table
routeTableId=`aws ec2 create-route-table --vpc-id $vpcId --query 'RouteTable.RouteTableId' --output text`
#Tag Route Table
aws ec2 create-tags --resources $routeTableId --tags Key=Name,Value=$vpcname-csye6225-public-route-table
echo "Route table created -> route table Id: "$routeTableId

#Create Route
aws ec2 create-route --route-table-id $routeTableId --destination-cidr-block 0.0.0.0/0 --gateway-id $gatewayId
echo "Route created: in "$routeTableId" target to "$gatewayId


# Associate Public Subnet with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $subnetId \
  --route-table-id $routeTableId \
  --region us-east-1)
echo "  Public Subnet ID '$subnetId' ASSOCIATED with Route Table ID" \
  "'$routeTableId'."



# Associate Public Subnet with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $subnetId_2 \
  --route-table-id $routeTableId \
  --region us-east-1)
echo "  Public Subnet ID '$subnetId_2' ASSOCIATED with Route Table ID" \
  "'$routeTableId'."


# Associate Public Subnet with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $subnetId_3 \
  --route-table-id $routeTableId \
  --region us-east-1)
echo "  Public Subnet ID '$subnetId_3' ASSOCIATED with Route Table ID" \
  "'$routeTableId'."



# Associate private Subnet with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $subnet_private_Id\
  --route-table-id $routeTableId \
  --region us-east-1)
echo "  Public Subnet ID '$subnet_private_Id' ASSOCIATED with Route Table ID" \
  "'$routeTableId'."




# Associate private Subnet with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $subnet_private_Id2 \
  --route-table-id $routeTableId \
  --region us-east-1)
echo "  Public Subnet ID '$subnet_private_Id2' ASSOCIATED with Route Table ID" \
  "'$routeTableId'."


# Associate private Subnet with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $subnet_private_Id3\
  --route-table-id $routeTableId \
  --region us-east-1)
echo "  Public Subnet ID '$subnet_private_Id3' ASSOCIATED with Route Table ID" \
  "'$routeTableId'."







#Job Done
echo "Job Done!"
