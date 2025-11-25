
## To change the endpoint
appwrite client --endpoint https://cloud.appwrite.io/v1

## To create a deployement
appwrite functions create-deployment --function-id="sendnotifs" --entrypoint="src/main.js" --code="functions/sendnotifs" --activate

## To create an execution
appwrite functions create-execution --function-id="sendnotifs"