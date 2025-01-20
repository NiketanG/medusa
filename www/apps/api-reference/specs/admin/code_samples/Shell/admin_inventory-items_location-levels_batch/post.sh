curl -X POST '{backend_url}/admin/inventory-items/location-levels/batch' \
-H 'Authorization: Bearer {access_token}' \
-H 'Content-Type: application/json' \
--data-raw '{
  "create": [
    {
      "location_id": "sloc_123",
      "inventory_item_id": "iitem_123",
      "stocked_quantity": 100,
      "incoming_quantity": 50
    }
  ],
  "update": [
    {
      "location_id": "sloc_456",
      "inventory_item_id": "iitem_456",
      "stocked_quantity": 200,
      "incoming_quantity": 75
    }
  ],
  "delete": [
    "iilev_123"
  ]
}'