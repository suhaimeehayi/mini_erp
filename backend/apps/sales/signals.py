"""Sales app signals.

Inventory deduction is handled explicitly in serializers/model workflow so status
changes stay transactional and validation errors are surfaced to the API caller.
"""