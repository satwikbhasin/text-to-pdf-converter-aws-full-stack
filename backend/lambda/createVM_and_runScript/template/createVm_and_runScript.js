const { EC2Client, RunInstancesCommand } = require("@aws-sdk/client-ec2");

const ec2Client = new EC2Client({});

exports.handler = async (event) => {
    const instanceImageId = "ami-06c68f701d8090592";
    const instanceType = "t2.micro";

    try {
        const { Records } = event;
        for (const record of Records) {
            console.log(record);
            if (record.eventName === "INSERT" && record.dynamodb) {

                const tableEntry = record.dynamodb.NewImage;
                
                const submissionId = tableEntry.id.S;
                const entryType = tableEntry.entryType.S;

                var S3SignAPI = "<S3_SIGN_API>";
                
                if (entryType == "input") {

                    // Define user data script
                    const user_data_script = `#!/bin/bash
        cd /home/ec2-user/
        echo '${submissionId}' > submissionId.txt
        
        SIGNED_URL_API="${S3SignAPI}uploads?type=download&key=script.py"
        response=$(curl -s $SIGNED_URL_API)
        
        download_url=$(echo $response | jq -r '.downloadURL')
        
        curl -O "$download_url"       

        chmod +x /home/ec2-user/script.py
        ./script.py
        shutdown -h now
        `;

                    // Encode user data script to base64
                    const user_data_base64 = Buffer.from(
                        user_data_script
                    ).toString("base64");

                    // Define instance launch parameters
                    const instanceParams = {
                        ImageId: instanceImageId,
                        InstanceType: instanceType,
                        MinCount: 1,
                        MaxCount: 1,
                        UserData: user_data_base64,
                        TagSpecifications: [
                            {
                                ResourceType: "instance",
                                Tags: [
                                    {
                                        Key: "Name",
                                        Value: `EC2Instance-${submissionId}`,
                                    },
                                ],
                            },
                        ],
                        InstanceInitiatedShutdownBehavior: "terminate"
                    };
                    
                    
                    // Launch EC2 instance
                    await ec2Client.send(new RunInstancesCommand(instanceParams));}
            }
        }

        return { statusCode: 200, body: "Success" };
    } catch (error) {
        console.error("Error:", error);
        return { statusCode: 500, body: JSON.stringify(error.message) };
    }
};
