curl -X POST '{backend_url}/store/orders/{id}/transfer/decline' \
-H 'x-publishable-api-key: {your_publishable_api_key}' \
-H 'Content-Type: application/json' \
--data-raw '{
  "token": "{value}"
}'