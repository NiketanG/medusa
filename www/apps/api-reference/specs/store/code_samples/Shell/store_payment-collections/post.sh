curl -X POST '{backend_url}/store/payment-collections' \
-H 'Content-Type: application/json' \
-H 'x-publishable-api-key: {your_publishable_api_key}' \
--data-raw '{
  "cart_id": "{value}"
}'