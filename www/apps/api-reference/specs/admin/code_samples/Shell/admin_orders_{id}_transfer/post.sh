curl -X POST '{backend_url}/admin/orders/{id}/transfer' \
-H 'Authorization: Bearer {access_token}' \
-H 'Content-Type: application/json' \
--data-raw '{
  "customer_id": "cus_123"
}'