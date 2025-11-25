
## To change the endpoint
appwrite client --endpoint https://cloud.appwrite.io/v1

## To create a deployement
appwrite functions create-deployment --function-id="sendnotifs" --entrypoint="src/main.js" --code="functions/sendnotifs" --activate

## To create an execution

appwrite functions create-execution --function-id="sendnotifs"

himanshusoni@Himanshus-Mac-mini functions_apw % appwrite functions create-execution \
  --function-id="sendnotifs" \
  --body='{
    "title":"📢 Personalized Alert",
    "msg":"Only for selected users!",
    "tokens":["ExponentPushToken[ev17fPFlicJShy3CYdgzOm]"]         
  }'    

## Custom Notification

{
  "title": "📢 Breaking News!",
  "msg": "Custom notification just for today!"
}

{
  "title": "🔥 Special Update!",
  "msg": "Only for selected users.",
  "tokens":["ExponentPushToken[ev17fPFlicJShy3CYdgzOm]"]
}