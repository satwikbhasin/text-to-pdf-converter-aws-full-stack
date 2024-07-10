const { EC2Client, RunInstancesCommand } = require("@aws-sdk/client-ec2");

exports.handler = async (event) => {
    const ec2Client = new EC2Client({});
    const instanceImageId = "ami-06c68f701d8090592";
    const instanceType = "t2.micro";

    try {
        const { Records } = event;
        for (const record of Records) {
            if (record.eventName === "INSERT" && record.dynamodb) {

                const tableEntry = record.dynamodb.NewImage;
                if (tableEntry.submitter.S === "user") {
                    const submissionId = tableEntry.id.S;
                    var S3SignAPI = "https://2a9vriqi8d.execute-api.us-east-1.amazonaws.com/prod/";
                    const user_data_script = `#!/bin/bash
        cd /home/ec2-user/
        
        SIGNED_URL_API="${S3SignAPI}?type=download&s3_path=script.py"
        response=$(curl -s $SIGNED_URL_API)
        download_url=$(echo $response | jq -r '.downloadURL')
        curl -O "$download_url"       
        
        sudo yum install -y python3-pip
        pip3 install fpdf

        chmod +x /home/ec2-user/script.py
        ./script.py ${submissionId}
        shutdown -h now
        `;

                    const user_data_base64 = Buffer.from(
                        user_data_script
                    ).toString("base64");

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
                                        Value: `${submissionId}`,
                                    },
                                ],
                            },
                        ],
                        InstanceInitiatedShutdownBehavior: "terminate"
                    };

                    await ec2Client.send(new RunInstancesCommand(instanceParams));
                }
            }
        }

        return { statusCode: 200, body: "Success" };
    } catch (error) {
        console.error("Error:", error);
        return { statusCode: 500, body: JSON.stringify(error.message) };
    }
};
