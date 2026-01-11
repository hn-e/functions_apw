
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
  "__type":"__send_notification",
  "__title": "📢 Breaking News!",
  "__msg": "Custom notification just for today!"
}

{
  "__type":"__send_notification",
  "__title": "🔥 Special Update!",
  "__msg": "Only for selected users.",
  "__tokens":["ExponentPushToken[ev17fPFlicJShy3CYdgzOm]"]
}

himanshusoni@Himanshus-Mac-mini functions_apw % appwrite functions create-execution \
  --function-id="sendnotifs" \
  --body='{
    "__type":"__send_notification",
    "__title":"📢 Personalized Alert",
    "__msg":"Only for selected users!",
    "__tokens":["ExponentPushToken[On5_gsFI-P5I_Nfkd1SUW7]"]         
  }'


  himanshusoni@Himanshus-Mac-mini functions_apw % appwrite functions create-execution \                                                                                              
  --function-id="sendnotifs" \
  --body='{
    "__action":"__party_fetch",
    "partyId":"695232ff003579be78e0"
  }'